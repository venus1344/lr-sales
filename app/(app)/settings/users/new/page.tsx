import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { UserForm } from '../form'

export const instant = false

export default async function NewUserPage() {
  await requireAbility('user_store')

  const roles = await prisma.roles.findMany({ orderBy: { name: 'asc' } })

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">New user</h1>
      <UserForm roles={roles.map((role) => ({ id: String(role.id), name: role.name }))} />
    </main>
  )
}
