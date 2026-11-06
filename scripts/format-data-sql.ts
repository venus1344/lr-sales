/**
 * Turn a cleaned mysqldump into an idempotent data load for the boot importer.
 *
 *   npx tsx scripts/format-data-sql.ts <dump.sql> [out.sql]
 *
 * Transformations (see `formatDataSql`):
 *   - `DROP TABLE`           removed — never delete data
 *   - `CREATE TABLE`         -> `CREATE TABLE IF NOT EXISTS`
 *   - `LOCK TABLES`/`UNLOCK` removed — not needed and need extra privileges
 *   - `INSERT INTO`          -> `INSERT IGNORE INTO` — a row that already
 *                             exists is kept, so re-running never modifies or
 *                             deletes data
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { pathToFileURL } from 'node:url'

/** Pure transformation: safe to apply any number of times. */
export function formatDataSql(sql: string): string {
  let out = sql

  // Never wipe data on re-runs.
  out = out.replace(/^DROP TABLE IF EXISTS `[^`]+`;\n?/gm, '')

  // Create tables only when the schema push did not already create them.
  out = out.replace(/^CREATE TABLE `([^`]+)`/gm, 'CREATE TABLE IF NOT EXISTS `$1`')

  // Locks are unnecessary and need extra privileges.
  out = out.replace(/^LOCK TABLES .*;\n?/gm, '')
  out = out.replace(/^UNLOCK TABLES;\n?/gm, '')

  // Insert-if-absent: re-running the file is a no-op for existing rows.
  out = out.replace(/^INSERT INTO `([^`]+)` VALUES/gm, 'INSERT IGNORE INTO `$1` VALUES')

  return out
}

export const DATA_SQL_HEADER = `-- Idempotent data load for welink-sales.
--
-- Generated from a cleaned mysqldump with:
--   npx tsx scripts/format-data-sql.ts <dump.sql> db/data.sql
--
-- DROP TABLE removed, CREATE TABLE IF NOT EXISTS, INSERT IGNORE, no locks.
-- Safe to run on every boot: it only inserts rows that are missing and never
-- modifies or deletes existing data.
--
-- This file is local-only (db/*.sql is gitignored): it is not committed.

`

function main(): void {
  const [input, output = 'db/data.sql'] = process.argv.slice(2)

  if (!input) {
    console.error('usage: npx tsx scripts/format-data-sql.ts <dump.sql> [out.sql]')
    process.exit(1)
  }

  const formatted = DATA_SQL_HEADER + formatDataSql(readFileSync(input, 'utf8'))
  mkdirSync(dirname(output), { recursive: true })
  writeFileSync(output, formatted)
  console.log(`wrote ${output} (${formatted.length} bytes)`)
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  main()
}
