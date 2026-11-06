import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { ExpenseForm } from '../form'

export const instant = false

export default async function NewExpensePage() {
  await requireAbility('expense_store')

  const [users, incomeAccounts, expenseAccounts, projects] = await Promise.all([
    prisma.users.findMany({ where: { active: true }, orderBy: { name: 'asc' } }),
    prisma.income_accounts.findMany({ where: { active: true }, orderBy: { name: 'asc' } }),
    prisma.expense_accounts.findMany({ where: { active: true }, orderBy: { name: 'asc' } }),
    prisma.projects.findMany({ orderBy: { name: 'asc' } }),
  ])

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">New expense</h1>
      <ExpenseForm
        users={users.map((user) => ({ id: String(user.id), name: user.name }))}
        incomeAccounts={incomeAccounts.map((account) => ({ id: String(account.id), name: account.name }))}
        expenseAccounts={expenseAccounts.map((account) => ({ id: String(account.id), name: account.name }))}
        projects={projects.map((project) => ({ id: String(project.id), name: project.name }))}
      />
    </main>
  )
}
