import Link from 'next/link'

import { formatTin } from '@/lib/format'
import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { deleteSupplier } from './actions'

export const instant = false

export default async function SuppliersPage() {
  await requireAbility('supplier_list')

  const suppliers = await prisma.suppliers.findMany({ orderBy: { name: 'asc' } })

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Suppliers</h1>
        <Link href="/settings/suppliers/new" className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
          New supplier
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-md border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-gray-500">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Location</th>
              <th className="px-4 py-2">Contacts</th>
              <th className="px-4 py-2">TIN</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">No suppliers yet.</td>
              </tr>
            ) : (
              suppliers.map((supplier) => (
                <tr key={String(supplier.id)} className="border-b last:border-0">
                  <td className="px-4 py-2 font-medium">{supplier.name}</td>
                  <td className="px-4 py-2">{supplier.location}</td>
                  <td className="px-4 py-2">{supplier.contacts}</td>
                  <td className="px-4 py-2">{formatTin(supplier.tin)}</td>
                  <td className="px-4 py-2">{supplier.status ? 'Active' : 'Inactive'}</td>
                  <td className="px-4 py-2 text-right">
                    <Link href={`/settings/suppliers/${supplier.id}/edit`} className="mr-3 text-blue-600 hover:underline">Edit</Link>
                    <form action={deleteSupplier.bind(null, String(supplier.id))} className="inline">
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
