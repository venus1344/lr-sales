import { notFound } from 'next/navigation'

import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { RoleForm } from '../../form'

export const instant = false

export default async function EditRolePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await requireAbility('role_update')

  const role = await prisma.roles.findUnique({
    where: { id: BigInt(id) },
    include: { ability_role: { select: { ability_id: true } } },
  })

  if (!role) {
    notFound()
  }

  const abilities = await prisma.abilities.findMany({ orderBy: { name: 'asc' } })

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Edit role</h1>
      <RoleForm
        abilities={abilities.map((ability) => ({
          id: String(ability.id),
          label: ability.label ?? ability.name,
        }))}
        role={{
          id: String(role.id),
          name: role.name,
          description: role.description ?? '',
          abilityIds: role.ability_role.map((entry) => String(entry.ability_id)),
        }}
      />
    </main>
  )
}
