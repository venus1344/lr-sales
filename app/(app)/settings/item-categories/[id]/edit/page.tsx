import { notFound } from 'next/navigation'

import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { ItemCategoryForm } from '../../form'

export const instant = false

export default async function EditItemCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await requireAbility('item_category_update')

  const category = await prisma.item_categories.findUnique({ where: { id: BigInt(id) } })
  if (!category) {
    notFound()
  }

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Edit item category</h1>
      <ItemCategoryForm
        category={{
          id: String(category.id),
          name: category.name,
          description: category.description,
          active: category.active,
        }}
      />
    </main>
  )
}
