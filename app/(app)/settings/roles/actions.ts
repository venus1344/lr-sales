'use server'

import { revalidatePath } from 'next/cache'

import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { roleSchema } from '@/lib/validation/role'
import { redirectWithToast } from '@/lib/toast'

export type RoleFormState = { error?: string }

function readAbilityIds(formData: FormData): string[] {
  return formData.getAll('abilities').map(String)
}

export async function createRole(
  _prev: RoleFormState,
  formData: FormData,
): Promise<RoleFormState> {
  const session = await requireAbility('role_store')

  const result = roleSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
  })
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid input' }
  }

  const abilityIds = readAbilityIds(formData)
  if (abilityIds.length === 0) {
    return { error: 'Select at least one ability' }
  }

  const actor = BigInt(session.user.id)
  const role = await prisma.roles.create({
    data: {
      name: result.data.name,
      description: result.data.description,
      created_by: actor,
    },
  })

  await prisma.ability_role.createMany({
    data: abilityIds.map((abilityId) => ({
      role_id: role.id,
      ability_id: BigInt(abilityId),
      created_by: actor,
    })),
  })

  revalidatePath('/settings/roles')
  return redirectWithToast('/settings/roles', 'Role created')
}

export async function updateRole(
  id: string,
  _prev: RoleFormState,
  formData: FormData,
): Promise<RoleFormState> {
  const session = await requireAbility('role_update')

  const result = roleSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
  })
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid input' }
  }

  const abilityIds = readAbilityIds(formData)
  if (abilityIds.length === 0) {
    return { error: 'Select at least one ability' }
  }

  const roleId = BigInt(id)
  const actor = BigInt(session.user.id)

  await prisma.$transaction([
    prisma.ability_role.deleteMany({ where: { role_id: roleId } }),
    prisma.roles.update({
      where: { id: roleId },
      data: { name: result.data.name, description: result.data.description, updated_by: actor },
    }),
    ...abilityIds.map((abilityId) =>
      prisma.ability_role.create({
        data: { role_id: roleId, ability_id: BigInt(abilityId), created_by: actor },
      }),
    ),
  ])

  revalidatePath('/settings/roles')
  return redirectWithToast('/settings/roles', 'Role updated')
}

export async function deleteRole(id: string): Promise<void> {
  await requireAbility('role_remove')

  await prisma.roles.delete({ where: { id: BigInt(id) } })

  revalidatePath('/settings/roles')
}
