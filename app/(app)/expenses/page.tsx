import Link from 'next/link'

import { Pagination } from '@/components/pagination'
import { RowActions } from '@/components/row-actions'
import { SearchForm } from '@/components/search-form'
import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { deleteExpense } from './actions'

export const instant = false

const PAGE_SIZE = 15

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  await requireAbility('expense_list')

  const { q = '', page = '1' } = await searchParams
  const pageNum = Math.max(1, Number(page) || 1)
  const where = q
    ? {
        OR: [
          { receipt_number: { contains: q } },
          { narration: { contains: q } },
          { expense_accounts: { name: { contains: q } } },
          { income_accounts: { name: { contains: q } } },
          { users_expenses_requested_byTousers: { name: { contains: q } } },
        ],
      }
    : undefined

  const [expenses, total] = await Promise.all([
    prisma.expenses.findMany({
      where,
      orderBy: { id: 'desc' },
      skip: (pageNum - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        users_expenses_requested_byTousers: true,
        expense_accounts: true,
        income_accounts: true,
      },
    }),
    prisma.expenses.count({ where }),
  ])

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Expenses</h1>
        <Link href="/expenses/new" className="sk-btn">New expense</Link>
      </div>

      <div className="mt-4">
        <SearchForm placeholder="Search expenses…" defaultValue={q} />
      </div>

      <div className="sk-card mt-4 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="sk-table-head text-left">
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Receipt</th>
              <th className="px-4 py-2 text-right">Amount</th>
              <th className="px-4 py-2">Requested by</th>
              <th className="px-4 py-2">Used for</th>
              <th className="px-4 py-2">Narration</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-400">No expenses found.</td>
              </tr>
            ) : (
              expenses.map((expense) => (
                <tr key={String(expense.id)} className="border-b last:border-0">
                  <td className="px-4 py-2">
                    {expense.created_at ? expense.created_at.toISOString().slice(0, 10) : '—'}
                  </td>
                  <td className="px-4 py-2 font-medium">
                    {expense.receipt ? (
                      <a href={expense.receipt} target="_blank" rel="noopener" className="sk-link">
                        {expense.receipt_number}
                      </a>
                    ) : (
                      expense.receipt_number
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">{Number(expense.amount).toLocaleString()}</td>
                  <td className="px-4 py-2">{expense.users_expenses_requested_byTousers.name}</td>
                  <td className="px-4 py-2">{expense.expense_accounts.name}</td>
                  <td className="px-4 py-2">
                    {expense.narration.length > 50 ? `${expense.narration.slice(0, 50)}…` : expense.narration}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <RowActions
                      actions={[
                        {
                          kind: 'link',
                          label: 'Edit',
                          icon: 'edit',
                          href: `/expenses/${expense.id}/edit`,
                        },
                        {
                          kind: 'submit',
                          label: 'Delete',
                          icon: 'trash',
                          danger: true,
                          submit: deleteExpense,
                          id: String(expense.id),
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination page={pageNum} total={total} pageSize={PAGE_SIZE} query={q} />
      </div>
    </main>
  )
}
