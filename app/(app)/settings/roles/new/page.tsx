import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { RoleForm } from '../form'

export const instant = false

export default async function NewRolePage() {
  await requireAbility('role_store')

  const abilities = await prisma.abilities.findMany({ orderBy: { name: 'asc' } })

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">New role</h1>
      <RoleForm
        abilities={abilities.map((ability) => ({
          id: String(ability.id),
          label: ability.label ?? ability.name,
        }))}
      />
    </main>
  )
}
