# WeLink Sales

Self-hosted invoicing and sales management for **WeLink Contracting Limited** — master data,
proformas, invoices, delivery notes, local purchase orders, expenses, and print-ready documents.

Built with Next.js 16, TypeScript, Prisma 7 and MySQL 8.

> This is a from-scratch rebuild of the legacy Laravel `laraforma` application. It keeps that
> app's data model, document numbering and workflows (feature parity), and replaces its stack
> and its unenforced security controls. The working agreement lives in [`RULES.md`](RULES.md);
> the plan and behaviour spec live in [`docs/`](docs/).

## Features

| Area | What it covers |
|---|---|
| Dashboard | KPI cards, 12-month income chart, recent proformas and projects |
| Master data | Customers, suppliers, items, item categories, currencies, packages, income/expense accounts — searchable, paginated lists with read-only record pages |
| Documents | Proformas, invoices, delivery notes and LPOs — create, edit, delete, convert (proforma → invoice, invoice → delivery note), with per-line item pickers |
| Printing | A4 print views that reproduce the original sample PDFs: letterhead, bank details, coloured totals, terms and services |
| Finance | Expenses with receipt upload, income and expense accounts |
| Administration | Users (create/edit, block/unblock, role assignment), roles and abilities, profile/password, key/value settings |
| Auth | Auth.js credentials sign-in, JWT sessions, server-side RBAC abilities (`super` users bypass) |

## Stack

- **Framework:** Next.js 16.4 (App Router, Turbopack) · React 19 · TypeScript
- **Data:** Prisma 7 with the MariaDB driver adapter (`@prisma/adapter-mariadb`) on MySQL 8
- **Auth:** Auth.js v5 credentials provider, JWT sessions, bcrypt passwords
- **Validation:** Zod v4 (server actions and forms)
- **UI:** Tailwind v4 with a small `.sk-*` design-system layer
- **Testing:** Vitest (unit) and Playwright (browser)
- **Database (dev):** MySQL 8 in Docker

## Requirements

- Node.js **20.9+** (Next.js 16 minimum; developed on Node 22)
- npm
- Docker (for the local MySQL 8 container)

## Getting started

### 1. Install dependencies

```bash
npm install
npx prisma generate   # the generated Prisma client is gitignored
```

### 2. Configure the environment

```bash
cp .env.example .env
```

Fill in `.env`:

| Key | Purpose |
|---|---|
| `DATABASE_URL` | MySQL connection string — local dev: `mysql://welink:<password>@localhost:3307/welink_sales` |
| `MYSQL_PASSWORD` / `MYSQL_ROOT_PASSWORD` | Credentials for the Docker container |
| `AUTH_SECRET` | Session signing secret — generate with `openssl rand -base64 32` |

### 3. Start the database

```bash
docker compose up -d   # MySQL 8, host port 3307, database `welink_sales`
```

### 4. Load the schema and data

The data model is [`prisma/schema.prisma`](prisma/schema.prisma) (32 tables, introspected from
the legacy database).

- **Fresh, empty database:** apply the schema with `npx prisma db push`.
- **Working dataset:** restore the cleaned `laraforma` dump into `welink_sales`. The dump is
  not committed — ask the project owner. Verify connectivity afterwards with
  `npx tsx scripts/check-db.ts`.

There is no seed/bootstrap command: the first administrator account comes from the restored dump.

### 5. Run it

```bash
npm run dev   # http://localhost:3000
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server with Turbopack (port 3000) |
| `npm run build` | Production build |
| `npm start` | Production server |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit tests |
| `npm run test:e2e` | Playwright suite — builds, starts the production server on port 3100, runs `e2e/` |
| `npm run start:e2e` | Production server on port 3100 (used by Playwright) |

## Testing

```bash
npm test          # unit tests (pricing, numbering, validation, RBAC, uploads…)
npm run test:e2e  # browser tests (documents, dashboard, master data, expenses)
```

On first run install the browser once: `npx playwright install chromium` — browsers are kept in
`./.playwright-browsers` (see `playwright.config.ts`). E2E overrides: `E2E_BASE_URL`,
`E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD`.

## Deployment (Docker)

The production stack is self-contained — MySQL, a schema step, an idempotent legacy-data
import, a seed step, and the app — via [`docker-compose.prod.yml`](docker-compose.prod.yml).
On a VPS:

```bash
cp .env.example .env                 # MYSQL_* , AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, APP_PORT
mkdir -p db                          # then generate db/data.sql from your backup (below)
docker compose -f docker-compose.prod.yml up -d --build
```

Each `up` runs, in order: `migrate` (Prisma schema), `import` (the legacy dataset from
`db/data.sql`), `seed` (RBAC abilities, Admin role, super-admin from env, one-time burn of
imported legacy passwords), then `app`. Every step is idempotent — re-running never drops
or overwrites data. Imported non-admin accounts get unusable passwords once; an admin resets
them from **Administration → Users**.

`db/data.sql` is **local-only and gitignored** (the SQL data is never committed). Generate
it from a cleaned `mysqldump`:

```bash
npx tsx scripts/format-data-sql.ts /path/to/backup.sql db/data.sql
```

The transform removes `DROP`/`LOCK`, uses `CREATE TABLE IF NOT EXISTS` and `INSERT IGNORE`,
so it can be applied on every boot. To replace the dataset from a full backup, use
`scripts/import-sql.sh /path/to/backup.sql`. The app is published on `127.0.0.1:3000` for
your existing reverse proxy. Full runbook (boot order, updates, backups, restore,
Nginx/Caddy snippets, troubleshooting): [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## Project layout

```
app/
  (app)/                    authenticated shell (sidebar, header, breadcrumbs)
    page.tsx                dashboard
    settings/<entity>/      master-data list / new / [id] (record) / [id]/edit
    documents/<type>/       list / new / [id] (record) / [id]/edit / [id]/print
  api/auth/[...nextauth]/   Auth.js handlers
  api/search/<entity>/      JSON search endpoints for the comboboxes
  api/receipts/[name]/      authenticated expense-receipt download
  signin/page.tsx           credentials sign-in
components/                 record/document views, combobox, row actions, charts, toast, print layout, icons
lib/                        auth, prisma, pricing, numbering, formatting, validation, uploads
prisma/schema.prisma        data model (MySQL 8)
tests/                      Vitest suites
e2e/                        Playwright suites
scripts/                    dev utilities and deployment helpers
                            (check-db.ts, seed.ts, format-data-sql.ts, import-sql.sh)
Dockerfile                  production image (standalone runtime + migration toolchain)
docker-compose.prod.yml     VPS stack: MySQL + migrate/import/seed + app
db/                         local-only boot dataset (data.sql is gitignored)
```

## Data model & document rules

- **Numbering** — `lib/numbering.ts`: `WE/PF/`, `WE/INV/` and `WE/LPO/` (`WE/INTERNET/INV/` is
  reserved for ISP billing), formatted as `<prefix>No:<sequence>`; the next sequence is the
  highest existing one plus one.
- **Totals** — `lib/pricing.ts`:
  `total = subtotal + VAT + labour − discount − withholding − advance`, rounded to 2 decimal
  places. Amounts are stored as `Decimal(25,2)`.
- **RBAC** — abilities are `<module>_list|_store|_update|_remove` plus document-specific ones,
  stored in `abilities` / `ability_role` / `role_user`.

## Printing

- A4 (`@page`) with 10 mm margins; colours are forced with `print-color-adjust: exact`.
- Header: logo, company block, document type, number and date. Footer: bank details and totals
  (proformas/invoices), terms and services — header and footer never split across pages.
- Single-page documents pin the footer to the bottom; long documents paginate in block flow.

## Security notes

This app was built to remove the failure modes of the legacy system:

- No terminal, shell-exec or `eval` surface, and no unauthenticated command endpoint.
- Passwords are bcrypt-hashed; secrets live only in `.env` (gitignored). No hardcoded credentials.
- Every page and server action checks the session and the relevant ability server-side —
  abilities are enforced, not merely defined.
- All database access goes through Prisma (parameterized). No raw SQL with user input.
- Expense receipts are stored outside the web root and served only through an authenticated route.
- Never copy code or files from the quarantined legacy tree (see `RULES.md` §3).

## Contributing

[`RULES.md`](RULES.md) is the binding working agreement:

- Every change starts on a branch off `main` (`feature/`, `fix/`, `test/`, `chore/`,
  `docs/`, `refactor/`); **never commit directly to `main`**.
- One branch = one concern; small, atomic commits in Conventional Commits style.
- Tests are required for behaviour changes; the owner reviews and merges pull requests.
- No co-author/attribution trailers in commit messages.
- Definition of done: `npm test`, `npm run lint`, `npx tsc --noEmit`, `npm run build`.

## Roadmap

Parity gaps still to port from the legacy app (tracked in [`docs/PLAN.md`](docs/PLAN.md)):

- **Internet / ISP billing** — models exist (`internet_invoices`, …), UI and numbering pending.
- **Projects** — models exist (`projects`, `project_statuses`, `project_files`), UI pending.
- **Due-invoice reminder emails** — settings-driven notifications with SMTP from env.
