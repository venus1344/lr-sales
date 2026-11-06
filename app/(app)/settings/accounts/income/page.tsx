import Link from 'next/link'

import { ClickableRow } from '@/components/clickable-row'
import { RowActions } from '@/components/row-actions'
import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { deleteIncomeAccount } from './actions'

export const instant = false

export default async function IncomeAccountsPage() {
  await requireAbility('income_account_list')

  const accounts = await prisma.income_accounts.findMany({ orderBy: { name: 'asc' } })

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Income accounts</h1>
        <Link href="/settings/accounts/income/new" className="sk-btn">New income account</Link>
      </div>

      <div className="sk-card mt-4 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="sk-table-head text-left">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {accounts.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">No income accounts.</td>
              </tr>
            ) : (
              accounts.map((account) => (
                <ClickableRow key={String(account.id)} href={`/settings/accounts/income/${account.id}/edit`}>
                  <td className="px-4 py-2 font-medium">{account.name}</td>
                  <td className="px-4 py-2">{account.description}</td>
                  <td className="px-4 py-2">{account.active ? 'Active' : 'Inactive'}</td>
                  <td className="px-4 py-2 text-right">
                    <RowActions
                      actions={[
                        {
                          kind: 'link',
                          label: 'Edit',
                          icon: 'edit',
                          href: `/settings/accounts/income/${account.id}/edit`,
                        },
                        {
                          kind: 'submit',
                          label: 'Delete',
                          icon: 'trash',
                          danger: true,
                          submit: deleteIncomeAccount,
                          id: String(account.id),
                        },
                      ]}
                    />
                  </td>
                </ClickableRow>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}
