import { notFound } from 'next/navigation'

import { RecordActions, RecordView } from '@/components/record-view'
import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { deleteItemFromView } from '../actions'

export const instant = false

export default async function ItemViewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await requireAbility('item_list')

  const item = await prisma.items.findUnique({
    where: { id: BigInt(id) },
    include: { item_categories: true },
  })
  if (!item) {
    notFound()
  }

  return (
    <RecordView
      title={item.name}
      subtitle="Item"
      actions={
        <RecordActions
          editHref={`/settings/items/${item.id}/edit`}
          deleteAction={deleteItemFromView.bind(null, String(item.id))}
        />
      }
      fields={[
        { label: 'Category', value: item.item_categories?.name },
        { label: 'Unit of measure', value: item.unit_measure },
        { label: 'Price', value: item.price.toString() },
        { label: 'Specification', value: item.specification },
        { label: 'VAT', value: item.vat ? 'Yes' : 'No' },
        { label: 'Status', value: item.active ? 'Active' : 'Inactive' },
      ]}
    />
  )
}
