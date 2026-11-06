import { notFound } from 'next/navigation'

import { RecordActions, RecordView } from '@/components/record-view'
import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { deleteItemCategoryFromView } from '../actions'

export const instant = false

export default async function ItemCategoryViewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await requireAbility('item_category_list')

  const category = await prisma.item_categories.findUnique({ where: { id: BigInt(id) } })
  if (!category) {
    notFound()
  }

  return (
    <RecordView
      title={category.name}
      subtitle="Item category"
      actions={
        <RecordActions
          editHref={`/settings/item-categories/${category.id}/edit`}
          deleteAction={deleteItemCategoryFromView.bind(null, String(category.id))}
        />
      }
      fields={[
        { label: 'Name', value: category.name },
        { label: 'Description', value: category.description },
        { label: 'Status', value: category.active ? 'Active' : 'Inactive' },
      ]}
    />
  )
}
