# Deployment — Docker on a VPS

The production stack is self-contained (`docker-compose.prod.yml`): **MySQL, a schema
step, an idempotent data import, a seed step, and the app**. The app is published on
`127.0.0.1` only, so an existing reverse proxy on the VPS terminates TLS.

```
            ┌──────────────────────────── docker compose ────────────────────────────┐
  internet ─►│  reverse proxy (yours) ──► app:3000 ──► db:3306                        │
            │                              (standalone)        (mysql:8, volume)    │
            └────────────────────────────────────────────────────────────────────────┘
   volumes: db_data (MySQL data) · app_storage (private expense receipts)
```

## Boot order (every `up`)

| # | Service | What it does | Idempotent? |
|---|---|---|---|
| 1 | `db` | MySQL 8, waits until healthy | — |
| 2 | `migrate` | `prisma db push` — creates/aligns the tables from `prisma/schema.prisma` | yes (no-op when aligned) |
| 3 | `import` | loads `db/data.sql` (the legacy dataset) if present | yes (`CREATE TABLE IF NOT EXISTS` + `INSERT IGNORE`) |
| 4 | `seed` | abilities, `Admin` role, super-admin from env, one-time legacy-password burn | yes |
| 5 | `app` | Next.js standalone server on port 3000 | — |

Nothing is ever dropped: re-running the stack never wipes or overwrites existing rows,
so it is safe to `docker compose up -d` on every deploy or reboot.

## The dataset file (`db/data.sql`)

- It is **local-only and gitignored** (`db/*.sql`) — the SQL data is never committed or
  baked into an image.
- `import` mounts `./db` and applies `data.sql` when it exists. If the file is missing the
  stack starts with an empty dataset (the seed still creates the admin), and the import is
  simply skipped.
- It is generated from a cleaned `mysqldump`:

  ```bash
  # with Node on the machine:
  npx tsx scripts/format-data-sql.ts /path/to/backup.sql db/data.sql

  # or through the Docker image (no Node on the VPS needed):
  mkdir -p db
  docker compose -f docker-compose.prod.yml build migrate
  docker compose -f docker-compose.prod.yml run --rm --no-deps \
    -v /path/to/backup.sql:/tmp/dump.sql:ro \
    -v "$PWD/db:/out" \
    migrate npx tsx scripts/format-data-sql.ts /tmp/dump.sql /out/data.sql
  ```

The transform is `DROP TABLE`, `LOCK TABLES` and `UNLOCK TABLES` removed,
`CREATE TABLE` → `CREATE TABLE IF NOT EXISTS`, and `INSERT INTO` → `INSERT IGNORE INTO`.
Re-running it therefore only inserts rows that are missing and never changes or deletes
existing data (unit-tested in `tests/format-data-sql.test.ts`).

## Prerequisites

- Docker Engine with the Compose plugin (`docker compose version`).
- Git (to pull the source on the VPS).
- A reverse proxy (Nginx/Caddy/Traefik) that can reach `127.0.0.1:3000`.
- A DNS record pointing your domain at the VPS.

## First deploy

```bash
git clone git@github.com:venus1344/lr-sales.git
cd lr-sales
cp .env.example .env
```

Fill in `.env`:

| Key | Value |
|---|---|
| `MYSQL_PASSWORD` | Password for the app's MySQL user |
| `MYSQL_ROOT_PASSWORD` | Password for MySQL root |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `ADMIN_EMAIL` | Super-admin login |
| `ADMIN_PASSWORD` | Super-admin password (strong; authoritative, re-applied on every boot) |
| `APP_PORT` | Host port for the app (default `3000`, loopback only) |

> Keep `.env` private (`chmod 600 .env`). It is gitignored and never baked into images.

If you have the data backup, prepare the boot dataset first (see above):

```bash
mkdir -p db
# generate db/data.sql from the backup — then:
```

Build and start:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Verify:

```bash
docker compose -f docker-compose.prod.yml ps          # db healthy, migrate/import/seed exited 0, app healthy
docker compose -f docker-compose.prod.yml logs -f app
curl -I http://127.0.0.1:3000/signin                  # expect 200
```

Then sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

### What happens to the imported accounts

On the first boot after an import, every account that is not the admin gets its password
replaced with a random unusable hash (legacy passwords are burned — the old system was
compromised). A `settings` row (`legacy_passwords_burned`) records that this happened once
so later boots do not touch user passwords again. Reset/reset-and-share passwords from
**Administration → Users**.

The admin account's password comes from `ADMIN_PASSWORD` and is re-applied on every boot,
so the env file remains the recovery path for the super-admin.

## Import / replace a SQL backup (manual)

`scripts/import-sql.sh` replaces the dataset from a full dump and regenerates
`db/data.sql` from it so future boots stay in sync:

```bash
scp backup.sql user@vps:/srv/backup.sql
ssh user@vps 'cd /srv/lr-sales && ./scripts/import-sql.sh /srv/backup.sql'
```

It drops and recreates the database (this is the one destructive path, by design), loads
the dump, regenerates `db/data.sql`, applies the schema, re-runs the seed and starts the
app.

## Day-to-day updates

```bash
git pull --ff-only
docker compose -f docker-compose.prod.yml up -d --build
```

The schema step, idempotent data import and seed run automatically. Data volumes are
untouched by rebuilds.

## Backups

Database:

```bash
docker compose -f docker-compose.prod.yml exec -T \
  -e MYSQL_PWD="$MYSQL_ROOT_PASSWORD" db \
  mysqldump -u root --single-transaction --routines --triggers welink_sales > backup-$(date +%F).sql
```

Receipts volume:

```bash
docker run --rm -v welink-sales_app_storage:/data -v "$PWD":/backup alpine \
  tar czf /backup/receipts-$(date +%F).tgz -C /data .
```

Restore a database dump with `scripts/import-sql.sh`; restore receipts by untarring into
the volume (`docker run --rm -v welink-sales_app_storage:/data -v "$PWD":/backup alpine tar
xzf /backup/receipts-YYYY-MM-DD.tgz -C /data`).

## Reverse proxy

The app listens on `127.0.0.1:3000` (change `APP_PORT` if taken). Point your proxy at it.

**Nginx**

```nginx
server {
    listen 443 ssl http2;
    server_name sales.example.com;

    ssl_certificate     /etc/letsencrypt/live/sales.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sales.example.com/privkey.pem;

    client_max_body_size 10m;   # receipt uploads

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Caddy**

```caddyfile
sales.example.com {
    reverse_proxy 127.0.0.1:3000
}
```

Auth.js trusts the incoming `Host` header (`trustHost: true`), so no separate `AUTH_URL` is
needed as long as the proxy forwards the original host.

## Security notes

- Only the app port is published, on `127.0.0.1` — MySQL is not reachable from outside.
- `AUTH_SECRET` must be long and random; rotating it signs everyone out.
- The seeded admin is a `super` user; use it to create real roles/users, then keep its
  credentials safe.
- Expense receipts are stored in the `app_storage` volume and served through an
  authenticated route — they are never in the image or the build context.
- `db/data.sql` contains personal data (and historical password hashes); it is gitignored
  and stays on the machine that runs the stack.

## Troubleshooting

```bash
docker compose -f docker-compose.prod.yml logs -f migrate   # schema step
docker compose -f docker-compose.prod.yml logs -f import    # data import
docker compose -f docker-compose.prod.yml logs -f seed      # abilities/admin
docker compose -f docker-compose.prod.yml run --rm --no-deps migrate   # re-run schema
docker compose -f docker-compose.prod.yml run --rm --no-deps seed      # re-run seed
```

- `seed` fails with "ADMIN_EMAIL is required" → set it in `.env`.
- App is unhealthy → check `logs app`; most often `DATABASE_URL`/`AUTH_SECRET` are missing
  or the DB is still starting.
- If `MYSQL_PASSWORD` contains URL-special characters (`@ : / # %`), percent-encode it in
  `DATABASE_URL` or rebuild the URL — the app parses `DATABASE_URL` as a URL.
- `import` logs "db/data.sql not present" → that is fine (empty dataset); generate the
  file first if you want the legacy data.
- `migrate` fails with `Prisma failed to detect the libssl/openssl version` → the image is
  missing OpenSSL (the Dockerfile installs it); rebuild with `docker compose -f
  docker-compose.prod.yml build --no-cache migrate app`.
- `migrate` fails with `unknown or unexpected option: --skip-generate` → stale image; Prisma 7
  removed that flag from `db push`. Rebuild the images.
