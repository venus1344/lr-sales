import { requireUser } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { PasswordForm, ProfileForm } from './form'

export const instant = false

export default async function ProfilePage() {
  const session = await requireUser()

  const user = await prisma.users.findUnique({ where: { id: BigInt(session.user.id) } })

  if (!user) {
    return null
  }

  return (
    <main className="mx-auto max-w-2xl space-y-8 px-4 py-8">
      <div>
        <h1 className="mb-6 text-2xl font-semibold">My profile</h1>
        <ProfileForm
          user={{
            name: user.name,
            email: user.email,
            location: user.location ?? '',
            skills: user.skills ?? '',
            education: user.education ?? '',
            notes: user.notes ?? '',
          }}
        />
      </div>

      <div className="sk-card p-4">
        <h2 className="mb-3 font-semibold">Change password</h2>
        <PasswordForm />
      </div>
    </main>
  )
}
