import Link from 'next/link'

import { ClickableRow } from '@/components/clickable-row'
import { RowActions } from '@/components/row-actions'
import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { deleteRole } from './actions'

export const instant = false

export default async function RolesPage() {
  await requireAbility('role_list')

  const roles = await prisma.roles.findMany({
    orderBy: { name: 'asc' },
    include: { ability_role: { include: { abilities: true } } },
  })

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Roles</h1>
        <Link href="/settings/roles/new" className="sk-btn">New role</Link>
      </div>

      <div className="sk-card mt-4 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="sk-table-head text-left">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Abilities</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">No roles found.</td>
              </tr>
            ) : (
              roles.map((role) => {
                const labels = role.ability_role
                  .map((entry) => entry.abilities.label ?? entry.abilities.name)
                  .sort()

                return (
                  <ClickableRow key={String(role.id)} href={`/settings/roles/${role.id}/edit`}>
                    <td className="px-4 py-2 font-medium">{role.name}</td>
                    <td className="px-4 py-2">{role.description}</td>
                    <td className="px-4 py-2">
                      {labels.slice(0, 4).map((label) => (
                        <span key={label} className="sk-badge sk-badge-on mr-1">{label}</span>
                      ))}
                      {labels.length > 4 ? <span className="text-gray-400">…</span> : null}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <RowActions
                        actions={[
                          {
                            kind: 'link',
                            label: 'Edit',
                            icon: 'edit',
                            href: `/settings/roles/${role.id}/edit`,
                          },
                          {
                            kind: 'submit',
                            label: 'Delete',
                            icon: 'trash',
                            danger: true,
                            submit: deleteRole,
                            id: String(role.id),
                          },
                        ]}
                      />
                    </td>
                  </ClickableRow>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}
