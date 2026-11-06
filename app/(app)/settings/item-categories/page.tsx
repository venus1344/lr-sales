import Link from 'next/link'

import { Pagination } from '@/components/pagination'
import { RowActions } from '@/components/row-actions'
import { SearchForm } from '@/components/search-form'
import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { deleteItemCategory } from './actions'

export const instant = false

const PAGE_SIZE = 15

export default async function ItemCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  await requireAbility('item_category_list')

  const { q = '', page = '1' } = await searchParams
  const pageNum = Math.max(1, Number(page) || 1)
  const where = q ? { name: { contains: q } } : undefined

  const [categories, total] = await Promise.all([
    prisma.item_categories.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: (pageNum - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.item_categories.count({ where }),
  ])

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Item categories</h1>
        <Link href="/settings/item-categories/new" className="sk-btn">New category</Link>
      </div>

      <div className="mt-4">
        <SearchForm placeholder="Search categories…" defaultValue={q} />
      </div>

      <div className="sk-card mt-4 overflow-hidden">
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
                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">No categories found.</td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={String(category.id)} className="border-b last:border-0">
                  <td className="px-4 py-2 font-medium">{category.name}</td>
                  <td className="px-4 py-2">{category.description}</td>
                  <td className="px-4 py-2">{category.active ? 'Active' : 'Inactive'}</td>
                  <td className="px-4 py-2 text-right">
                    <RowActions
                      actions={[
                        {
                          kind: 'link',
                          label: 'Edit',
                          icon: 'edit',
                          href: `/settings/item-categories/${category.id}/edit`,
                        },
                        {
                          kind: 'submit',
                          label: 'Delete',
                          icon: 'trash',
                          danger: true,
                          submit: deleteItemCategory,
                          id: String(category.id),
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination page={pageNum} total={total} pageSize={PAGE_SIZE} query={q} />
      </div>
    </main>
  )
}
