import { notFound } from 'next/navigation'

import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { ExpenseForm } from '../../form'

export const instant = false

export default async function EditExpensePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await requireAbility('expense_update')

  const expense = await prisma.expenses.findUnique({ where: { id: BigInt(id) } })
  if (!expense) {
    notFound()
  }

  const [users, incomeAccounts, expenseAccounts, projects] = await Promise.all([
    prisma.users.findMany({ where: { active: true }, orderBy: { name: 'asc' } }),
    prisma.income_accounts.findMany({ where: { active: true }, orderBy: { name: 'asc' } }),
    prisma.expense_accounts.findMany({ where: { active: true }, orderBy: { name: 'asc' } }),
    prisma.projects.findMany({ orderBy: { name: 'asc' } }),
  ])

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Edit expense</h1>
      <ExpenseForm
        users={users.map((user) => ({ id: String(user.id), name: user.name }))}
        incomeAccounts={incomeAccounts.map((account) => ({ id: String(account.id), name: account.name }))}
        expenseAccounts={expenseAccounts.map((account) => ({ id: String(account.id), name: account.name }))}
        projects={projects.map((project) => ({ id: String(project.id), name: project.name }))}
        expense={{
          id: String(expense.id),
          requested_by: String(expense.requested_by),
          income_account_id: String(expense.income_account_id),
          expense_account_id: String(expense.expense_account_id),
          project_id: expense.project_id ? String(expense.project_id) : null,
          receipt_number: expense.receipt_number ?? '',
          amount: Number(expense.amount),
          narration: expense.narration,
          receipt: expense.receipt,
        }}
      />
    </main>
  )
}
