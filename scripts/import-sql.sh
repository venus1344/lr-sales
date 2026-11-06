#!/usr/bin/env bash
# Replace the dataset from a full SQL backup (manual, one-off).
#
#   scripts/import-sql.sh /path/to/backup.sql
#
# Drops and recreates the database, loads the dump, regenerates the local
# boot-time dataset (db/data.sql, gitignored) from the same dump, applies the
# Prisma schema and re-runs the seed, then starts the app.
#
# The boot-time import needs no script: the compose `import` service applies
# db/data.sql on every boot when it exists (it is idempotent).
set -euo pipefail

cd "$(dirname "$0")/.."

COMPOSE=(docker compose -f docker-compose.prod.yml)
DUMP="${1:-}"

if [[ -z "$DUMP" || ! -f "$DUMP" ]]; then
  echo "usage: $0 /path/to/backup.sql" >&2
  exit 1
fi

read_env() {
  local key=$1
  grep -E "^${key}=" .env | head -n1 | cut -d= -f2- | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//"
}

MYSQL_ROOT_PASSWORD="$(read_env MYSQL_ROOT_PASSWORD)"
if [[ -z "$MYSQL_ROOT_PASSWORD" ]]; then
  echo "MYSQL_ROOT_PASSWORD is not set in .env" >&2
  exit 1
fi

DUMP_ABS="$(cd "$(dirname "$DUMP")" && pwd)/$(basename "$DUMP")"

echo "==> Stopping the app"
"${COMPOSE[@]}" stop app

echo "==> Recreating the welink_sales database"
"${COMPOSE[@]}" exec -T -e MYSQL_PWD="$MYSQL_ROOT_PASSWORD" db \
  mysql -u root -e "DROP DATABASE IF EXISTS welink_sales; CREATE DATABASE welink_sales;"

echo "==> Importing $DUMP ($(du -h "$DUMP_ABS" | cut -f1))"
"${COMPOSE[@]}" exec -T -e MYSQL_PWD="$MYSQL_ROOT_PASSWORD" db \
  mysql -u root welink_sales < "$DUMP_ABS"

echo "==> Regenerating db/data.sql from this dump (boot-time dataset, gitignored)"
mkdir -p db
"${COMPOSE[@]}" run --rm --no-deps \
  -v "$DUMP_ABS:/tmp/imported-dump.sql:ro" \
  -v "$(pwd)/db:/out" \
  migrate npx tsx scripts/format-data-sql.ts /tmp/imported-dump.sql /out/data.sql

echo "==> Applying the Prisma schema"
"${COMPOSE[@]}" run --rm --no-deps migrate

echo "==> Seeding abilities, the Admin role and the super-admin"
"${COMPOSE[@]}" run --rm --no-deps seed

echo "==> Starting the app"
"${COMPOSE[@]}" up -d --no-deps app

echo
echo "Done. db/data.sql was regenerated on this machine only (it is gitignored)."
