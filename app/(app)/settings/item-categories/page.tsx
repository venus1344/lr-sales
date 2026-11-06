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
          className="sk-btn"
        >
          New category
        </Link>
      </div>

      <div className="sk-card mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="sk-table-head text-left">
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
                  <td className="px-4 py-2"><span className={category.active ? 'sk-badge sk-badge-on' : 'sk-badge sk-badge-off'}>{category.active ? 'Active' : 'Inactive'}</span></td>
                  <td className="px-4 py-2 text-right">
                    <Link
                      href={`/settings/item-categories/${category.id}/edit`}
                      className="mr-3 sk-link"
                    >
                      Edit
                    </Link>
                    <form action={deleteItemCategory.bind(null, String(category.id))} className="inline">
                      <button type="submit" className="sk-link-danger">
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
