/**
 * Seed the database after the schema and the legacy data are in place.
 *
 *   npx tsx scripts/seed.ts
 *
 * Runs on every boot (compose `seed` service), so it must be idempotent:
 *
 *  - the super-admin account from env is created, or its password is reset to
 *    ADMIN_PASSWORD (that env value is authoritative for this account);
 *  - the RBAC ability catalog and the Admin role are created when missing and
 *    every ability is attached to the role;
 *  - on the first run after an import, every other account's password is
 *    replaced with an unusable hash (legacy passwords are burned; an
 *    administrator must reset them) — a `settings` row records that this ran
 *    once so later boots do not touch user passwords again.
 *
 * Credentials come from env only.
 */
import 'dotenv/config'

import { randomBytes } from 'node:crypto'

import { hashPassword } from '../lib/auth/password'
import { prisma } from '../lib/prisma'

const ABILITIES: readonly string[] = [
  // customers
  'customer_list',
  'customer_store',
  'customer_update',
  'customer_remove',
  // suppliers
  'supplier_list',
  'supplier_store',
  'supplier_update',
  'supplier_remove',
  // items
  'item_list',
  'item_store',
  'item_update',
  'item_remove',
  // item categories
  'item_category_list',
  'item_category_store',
  'item_category_update',
  'item_category_remove',
  // currencies
  'currency_list',
  'currency_store',
  'currency_update',
  'currency_remove',
  // packages
  'package_list',
  'package_store',
  'package_update',
  'package_remove',
  // proformas
  'proforma_list',
  'proforma_print',
  'proforma_store',
  'proforma_update',
  'proforma_remove',
  // invoices
  'invoice_list',
  'invoice_print',
  'invoice_store',
  'invoice_update',
  'invoice_remove',
  // delivery notes
  'dnote_list',
  'dnote_print',
  'dnote_store',
  'dnote_update',
  'dnote_remove',
  // local purchase orders
  'lpo_list',
  'lpo_print',
  'lpo_store',
  'lpo_update',
  'lpo_remove',
  // internet invoices (reserved for the ISP billing module)
  'internet_invoice_list',
  'internet_invoice_print',
  'internet_invoice_store',
  'internet_invoice_update',
  'internet_invoice_remove',
  // projects (reserved for the projects module)
  'project_list',
  'project_store',
  'project_update',
  'project_remove',
  // finance
  'income_account_list',
  'income_account_store',
  'income_account_update',
  'income_account_remove',
  'expense_account_list',
  'expense_account_store',
  'expense_account_update',
  'expense_account_remove',
  'expense_list',
  'expense_store',
  'expense_update',
  'expense_remove',
  // administration
  'user_list',
  'user_store',
  'user_update',
  'user_remove',
  'role_list',
  'role_store',
  'role_update',
  'role_remove',
  'view_settings',
  'set_settings',
]

const ADMIN_ROLE = {
  name: 'Admin',
  description: 'Office administration',
} as const

const LEGACY_PASSWORDS_MARKER = 'legacy_passwords_burned'

async function ensureAdminUser(): Promise<bigint> {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD
  const name = process.env.ADMIN_NAME ?? 'Administrator'

  if (!email) {
    throw new Error('ADMIN_EMAIL is required to seed the administrator account')
  }

  const existing = await prisma.users.findUnique({ where: { email } })

  if (existing) {
    // ADMIN_PASSWORD is authoritative for this account: re-applied every boot
    // so the env file can rotate it (e.g. to recover access).
    await prisma.users.update({
      where: { id: existing.id },
      data: {
        super: true,
        active: true,
        ...(password ? { password: await hashPassword(password) } : {}),
      },
    })
    return existing.id
  }

  if (!password) {
    throw new Error('ADMIN_PASSWORD is required to create the administrator account')
  }

  const created = await prisma.users.create({
    data: {
      name,
      email,
      password: await hashPassword(password),
      super: true,
      active: true,
      email_verified_at: new Date(),
    },
  })

  return created.id
}

async function ensureAbilities(): Promise<void> {
  const existing = new Set(
    (await prisma.abilities.findMany({ select: { name: true } })).map((row) => row.name),
  )
  const missing = ABILITIES.filter((name) => !existing.has(name))
  if (missing.length > 0) {
    await prisma.abilities.createMany({ data: missing.map((name) => ({ name })) })
  }
  console.log(`Abilities: ${missing.length} added, ${ABILITIES.length - missing.length} already present.`)
}

async function ensureAdminRole(adminId: bigint): Promise<void> {
  const abilities = await prisma.abilities.findMany({ select: { id: true, name: true } })
  const abilityIdByName = new Map(abilities.map((row) => [row.name, row.id]))
  const abilityIds = ABILITIES.map((name) => abilityIdByName.get(name)).filter(
    (id): id is bigint => id !== undefined,
  )

  let role = await prisma.roles.findFirst({ where: { name: ADMIN_ROLE.name } })
  if (!role) {
    role = await prisma.roles.create({
      data: {
        name: ADMIN_ROLE.name,
        description: ADMIN_ROLE.description,
        created_by: adminId,
      },
    })
  }

  if (abilityIds.length > 0) {
    await prisma.ability_role.createMany({
      data: abilityIds.map((abilityId) => ({
        role_id: role.id,
        ability_id: abilityId,
        created_by: adminId,
      })),
      skipDuplicates: true,
    })
  }

  await prisma.role_user.createMany({
    data: [{ user_id: adminId, role_id: role.id, created_by: adminId }],
    skipDuplicates: true,
  })
}

/**
 * Legacy account passwords are unusable: on the first run after an import every
 * non-admin account gets a random hash. A `settings` marker makes this a
 * one-time operation, so accounts created later keep their chosen passwords.
 */
async function burnLegacyPasswords(adminId: bigint): Promise<void> {
  const marker = await prisma.settings.findFirst({ where: { name: LEGACY_PASSWORDS_MARKER } })
  if (marker) {
    return
  }

  const unusable = await hashPassword(randomBytes(32).toString('hex'))
  const burned = await prisma.users.updateMany({
    where: { id: { not: adminId } },
    data: { password: unusable },
  })

  await prisma.settings.create({
    data: { name: LEGACY_PASSWORDS_MARKER, value: '1' },
  })

  console.log(`Burned the password of ${burned.count} imported account(s); an admin must reset them.`)
}

async function main(): Promise<void> {
  const adminId = await ensureAdminUser()
  await ensureAbilities()
  await ensureAdminRole(adminId)
  await burnLegacyPasswords(adminId)
  console.log('Seed complete.')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Seed failed:', error)
    process.exit(1)
  })
