import Link from 'next/link'

import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { deleteItemCategory } from './actions'

export const instant = false

export default async function ItemCategoriesPage() {
  await requireAbility('item_category_list')

  const categories = await prisma.item_categories.findMany({ orderBy: { name: 'asc' } })

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Item categories</h1>
        <Link
          href="/settings/item-categories/new"
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          New category
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-md border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-gray-500">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                  No categories yet.
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={String(category.id)} className="border-b last:border-0">
                  <td className="px-4 py-2 font-medium">{category.name}</td>
                  <td className="px-4 py-2">{category.description}</td>
                  <td className="px-4 py-2">{category.active ? 'Active' : 'Inactive'}</td>
                  <td className="px-4 py-2 text-right">
                    <Link
                      href={`/settings/item-categories/${category.id}/edit`}
                      className="mr-3 text-blue-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <form action={deleteItemCategory.bind(null, String(category.id))} className="inline">
                      <button type="submit" className="text-red-600 hover:underline">
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}
