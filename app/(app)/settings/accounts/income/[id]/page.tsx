import { notFound } from 'next/navigation'

import { RecordActions, RecordView } from '@/components/record-view'
import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { deleteIncomeAccountFromView } from '../actions'

export const instant = false

export default async function IncomeAccountViewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await requireAbility('income_account_list')

  const account = await prisma.income_accounts.findUnique({ where: { id: BigInt(id) } })
  if (!account) {
    notFound()
  }

  return (
    <RecordView
      title={account.name}
      subtitle="Income account"
      actions={
        <RecordActions
          editHref={`/settings/accounts/income/${account.id}/edit`}
          deleteAction={deleteIncomeAccountFromView.bind(null, String(account.id))}
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
