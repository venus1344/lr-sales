import Link from 'next/link'

import { ClickableRow } from '@/components/clickable-row'
import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'

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
            </tr>
          </thead>
          <tbody>
            {accounts.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-400">No income accounts.</td>
              </tr>
            ) : (
              accounts.map((account) => (
                <ClickableRow key={String(account.id)} href={`/settings/accounts/income/${account.id}`}>
                  <td className="px-4 py-2 font-medium">{account.name}</td>
                  <td className="px-4 py-2">{account.description}</td>
                  <td className="px-4 py-2">{account.active ? 'Active' : 'Inactive'}</td>
                </ClickableRow>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}
