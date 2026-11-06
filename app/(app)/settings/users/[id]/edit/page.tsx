import { notFound } from 'next/navigation'

import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { UserForm } from '../../form'

export const instant = false

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await requireAbility('user_update')

  const user = await prisma.users.findUnique({
    where: { id: BigInt(id) },
    include: { role_user_role_user_user_idTousers: { select: { role_id: true } } },
  })

  if (!user) {
    notFound()
  }

  const roles = await prisma.roles.findMany({ orderBy: { name: 'asc' } })

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Edit user</h1>
      <UserForm
        roles={roles.map((role) => ({ id: String(role.id), name: role.name }))}
        user={{
          id: String(user.id),
          name: user.name,
          email: user.email,
          roleIds: user.role_user_role_user_user_idTousers.map((entry) => String(entry.role_id)),
        }}
      />
    </main>
  )
}
