import { notFound } from 'next/navigation'

import { RecordActions, RecordView } from '@/components/record-view'
import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { deleteCurrencyFromView } from '../actions'

export const instant = false

export default async function CurrencyViewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await requireAbility('currency_list')

  const currency = await prisma.currencies.findUnique({ where: { id: BigInt(id) } })
  if (!currency) {
    notFound()
  }

  return (
    <RecordView
      title={currency.name}
      subtitle="Currency"
      actions={
        <RecordActions
          editHref={`/settings/currencies/${currency.id}/edit`}
          deleteAction={deleteCurrencyFromView.bind(null, String(currency.id))}
        />
      }
      fields={[
        { label: 'Code', value: currency.code },
        { label: 'Name', value: currency.name },
        { label: 'Rate', value: String(currency.rate) },
        { label: 'Status', value: currency.active ? 'Active' : 'Inactive' },
      ]}
    />
  )
}
