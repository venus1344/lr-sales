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
        <Link href="/settings/suppliers/new" className="sk-btn">
          New supplier
        </Link>
      </div>

      <div className="sk-card mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="sk-table-head text-left">
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
                  <td className="px-4 py-2"><span className={supplier.status ? 'sk-badge sk-badge-on' : 'sk-badge sk-badge-off'}>{supplier.status ? 'Active' : 'Inactive'}</span></td>
                  <td className="px-4 py-2 text-right">
                    <Link href={`/settings/suppliers/${supplier.id}/edit`} className="mr-3 sk-link">Edit</Link>
                    <form action={deleteSupplier.bind(null, String(supplier.id))} className="inline">
                      <button type="submit" className="sk-link-danger">Delete</button>
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
