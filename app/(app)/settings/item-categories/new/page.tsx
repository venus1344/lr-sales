import { requireAbility } from '@/lib/auth/guard'
import { ItemCategoryForm } from '../form'

export const instant = false

export default async function NewItemCategoryPage() {
  await requireAbility('item_category_store')

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">New item category</h1>
      <ItemCategoryForm />
    </main>
  )
}
