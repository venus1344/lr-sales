import { notFound } from 'next/navigation'

import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { ItemForm } from '../../form'

export const instant = false

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await requireAbility('item_update')

  const item = await prisma.items.findUnique({ where: { id: BigInt(id) } })
  if (!item) {
    notFound()
  }

  const categories = await prisma.item_categories.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  })

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Edit item</h1>
      <ItemForm
        item={{
          id: String(item.id),
          category_id: String(item.category_id),
          name: item.name,
          unit_measure: item.unit_measure,
          specification: item.specification,
          price: Number(item.price),
          active: item.active,
          vat: item.vat,
        }}
        categories={categories.map((c) => ({ id: String(c.id), name: c.name }))}
      />
    </main>
  )
}
