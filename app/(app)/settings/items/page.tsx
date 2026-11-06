import Link from 'next/link'

import { Pagination } from '@/components/pagination'
import { RowActions } from '@/components/row-actions'
import { SearchForm } from '@/components/search-form'
import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { deleteItem } from './actions'

export const instant = false

const PAGE_SIZE = 15

export default async function ItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  await requireAbility('item_list')

  const { q = '', page = '1' } = await searchParams
  const pageNum = Math.max(1, Number(page) || 1)
  const where = q ? { name: { contains: q } } : undefined

  const [items, total] = await Promise.all([
    prisma.items.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: (pageNum - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { item_categories: true },
    }),
    prisma.items.count({ where }),
  ])

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Items</h1>
        <Link href="/settings/items/new" className="sk-btn">New item</Link>
      </div>

      <div className="mt-4">
        <SearchForm placeholder="Search items…" defaultValue={q} />
      </div>

      <div className="sk-card mt-4 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="sk-table-head text-left">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Unit</th>
              <th className="px-4 py-2 text-right">Price</th>
              <th className="px-4 py-2">VAT</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-400">No items found.</td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={String(item.id)} className="border-b last:border-0">
                  <td className="px-4 py-2 font-medium">{item.name}</td>
                  <td className="px-4 py-2">{item.item_categories?.name}</td>
                  <td className="whitespace-nowrap px-4 py-2">{item.unit_measure}</td>
                  <td className="px-4 py-2 text-right">{item.price.toString()}</td>
                  <td className="px-4 py-2">{item.vat ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-2">{item.active ? 'Active' : 'Inactive'}</td>
                  <td className="px-4 py-2 text-right">
                    <RowActions
                      actions={[
                        {
                          kind: 'link',
                          label: 'Edit',
                          icon: 'edit',
                          href: `/settings/items/${item.id}/edit`,
                        },
                        {
                          kind: 'submit',
                          label: 'Delete',
                          icon: 'trash',
                          danger: true,
                          submit: deleteItem,
                          id: String(item.id),
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
