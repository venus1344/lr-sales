import Link from 'next/link'

import { ClickableRow } from '@/components/clickable-row'
import { Pagination } from '@/components/pagination'
import { RowActions } from '@/components/row-actions'
import { SearchForm } from '@/components/search-form'
import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { blockUser, unblockUser } from './actions'

export const instant = false

const PAGE_SIZE = 15

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  await requireAbility('user_list')

  const { q = '', page = '1' } = await searchParams
  const pageNum = Math.max(1, Number(page) || 1)
  const where = q
    ? {
        OR: [
          { name: { contains: q } },
          { email: { contains: q } },
          { location: { contains: q } },
        ],
      }
    : undefined

  const [users, total] = await Promise.all([
    prisma.users.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: (pageNum - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { role_user_role_user_user_idTousers: { include: { roles: true } } },
    }),
    prisma.users.count({ where }),
  ])

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Users</h1>
        <Link href="/settings/users/new" className="sk-btn">New user</Link>
      </div>

      <div className="mt-4">
        <SearchForm placeholder="Search users…" defaultValue={q} />
      </div>

      <div className="sk-card mt-4 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="sk-table-head text-left">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">E-mail</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Verification</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">No users found.</td>
              </tr>
            ) : (
              users.map((user) => (
                <ClickableRow key={String(user.id)} href={`/settings/users/${user.id}/edit`}>
                  <td className="px-4 py-2 font-medium">{user.name}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">
                    {user.role_user_role_user_user_idTousers.length === 0 ? (
                      <span className="text-gray-400">—</span>
                    ) : (
                      user.role_user_role_user_user_idTousers.map((entry) => (
                        <span key={String(entry.role_id)} className="sk-badge sk-badge-on mr-1">
                          {entry.roles.name}
                        </span>
                      ))
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <span className={user.email_verified_at ? 'sk-badge sk-badge-on' : 'sk-badge sk-badge-off'}>
                      {user.email_verified_at ? 'Verified' : 'Not verified'}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span className={user.active ? 'sk-badge sk-badge-on' : 'sk-badge sk-badge-off'}>
                      {user.active ? 'Active' : 'Blocked'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <RowActions
                      actions={[
                        {
                          kind: 'link',
                          label: 'Edit',
                          icon: 'edit',
                          href: `/settings/users/${user.id}/edit`,
                        },
                        user.active
                          ? {
                              kind: 'submit',
                              label: 'Block',
                              icon: 'trash',
                              danger: true,
                              submit: blockUser,
                              id: String(user.id),
                            }
                          : {
                              kind: 'submit',
                              label: 'Unblock',
                              icon: 'trash',
                              submit: unblockUser,
                              id: String(user.id),
                            },
                      ]}
                    />
                  </td>
                </ClickableRow>
              ))
            )}
          </tbody>
        </table>
        <Pagination page={pageNum} total={total} pageSize={PAGE_SIZE} query={q} />
      </div>
    </main>
  )
}
