import Link from 'next/link'

import { IconProfile, IconRoles, IconSettings, IconUsers } from '@/components/icons'
import { requireUser } from '@/lib/auth/guard'

export const instant = false

const cards = [
  {
    href: '/settings/users',
    label: 'Users',
    description: 'Create users, assign roles, block or unblock accounts.',
    icon: IconUsers,
  },
  {
    href: '/settings/roles',
    label: 'Roles',
    description: 'Define roles and the abilities each one grants.',
    icon: IconRoles,
  },
  {
    href: '/settings/profile',
    label: 'My profile',
    description: 'Update your details and change your password.',
    icon: IconProfile,
  },
  {
    href: '/settings/more',
    label: 'General settings',
    description: 'Manage system settings and review the change history.',
    icon: IconSettings,
  },
]

export default async function AdministrationPage() {
  await requireUser()

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Administration</h1>
      <p className="mt-1 text-sm text-gray-500">
        Manage users, roles, your profile, and system settings.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.href}
              href={card.href}
              className="sk-card flex items-start gap-3 p-5 hover:bg-gray-50"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                <Icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-medium">{card.label}</span>
                <span className="mt-0.5 block text-sm text-gray-500">{card.description}</span>
              </span>
            </Link>
          )
        })}
      </div>
    </main>
  )
}
