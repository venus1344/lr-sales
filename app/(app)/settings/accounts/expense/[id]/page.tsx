import { notFound } from 'next/navigation'

import { RecordActions, RecordView } from '@/components/record-view'
import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { deleteExpenseAccountFromView } from '../actions'

export const instant = false

export default async function ExpenseAccountViewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await requireAbility('expense_account_list')

  const account = await prisma.expense_accounts.findUnique({ where: { id: BigInt(id) } })
  if (!account) {
    notFound()
  }

  return (
    <RecordView
      title={account.name}
      subtitle="Expense account"
      actions={
        <RecordActions
          editHref={`/settings/accounts/expense/${account.id}/edit`}
          deleteAction={deleteExpenseAccountFromView.bind(null, String(account.id))}
        />
      }
      fields={[
        { label: 'Name', value: account.name },
        { label: 'Description', value: account.description },
        { label: 'Status', value: account.active ? 'Active' : 'Inactive' },
      ]}
    />
  )
}
