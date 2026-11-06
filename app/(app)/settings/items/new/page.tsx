import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { ItemForm } from '../form'

export const instant = false

export default async function NewItemPage() {
  await requireAbility('item_store')

  const categories = await prisma.item_categories.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  })

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">New item</h1>
      <ItemForm categories={categories.map((c) => ({ id: String(c.id), name: c.name }))} />
    </main>
  )
}
