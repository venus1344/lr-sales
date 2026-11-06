import { notFound } from 'next/navigation'

import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { ExpenseAccountForm } from '../../form'

export const instant = false

export default async function EditExpenseAccountPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await requireAbility('expense_account_update')

  const account = await prisma.expense_accounts.findUnique({ where: { id: BigInt(id) } })
  if (!account) {
    notFound()
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Edit expense account</h1>
      <ExpenseAccountForm
        account={{
          id: String(account.id),
          name: account.name,
          description: account.description,
          active: account.active,
        }}
      />
    </main>
  )
}
