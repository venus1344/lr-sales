import Link from 'next/link'

import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { deleteItem } from './actions'

export const instant = false

export default async function ItemsPage() {
  await requireAbility('item_list')

  const items = await prisma.items.findMany({
    orderBy: { name: 'asc' },
    include: { item_categories: true },
  })

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Items</h1>
        <Link href="/settings/items/new" className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
          New item
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-md border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-gray-500">
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
                <td colSpan={7} className="px-4 py-6 text-center text-gray-400">No items yet.</td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={String(item.id)} className="border-b last:border-0">
                  <td className="px-4 py-2 font-medium">{item.name}</td>
                  <td className="px-4 py-2">{item.item_categories?.name}</td>
                  <td className="px-4 py-2">{item.unit_measure}</td>
                  <td className="px-4 py-2 text-right">{item.price.toString()}</td>
                  <td className="px-4 py-2">{item.vat ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-2">{item.active ? 'Active' : 'Inactive'}</td>
                  <td className="px-4 py-2 text-right">
                    <Link href={`/settings/items/${item.id}/edit`} className="mr-3 text-blue-600 hover:underline">Edit</Link>
                    <form action={deleteItem.bind(null, String(item.id))} className="inline">
                      <button type="submit" className="text-red-600 hover:underline">Delete</button>
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
