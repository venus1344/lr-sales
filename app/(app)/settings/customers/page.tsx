import Link from 'next/link'

import { formatTin } from '@/lib/format'
import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { deleteCustomer } from './actions'

export const instant = false

export default async function CustomersPage() {
  await requireAbility('customer_list')

  const customers = await prisma.customers.findMany({ orderBy: { name: 'asc' } })

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Customers</h1>
        <Link href="/settings/customers/new" className="sk-btn">
          New customer
        </Link>
      </div>

      <div className="sk-card mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="sk-table-head text-left">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Location</th>
              <th className="px-4 py-2">Contact</th>
              <th className="px-4 py-2">TIN</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">No customers yet.</td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={String(customer.id)} className="border-b last:border-0">
                  <td className="px-4 py-2 font-medium">{customer.name}</td>
                  <td className="px-4 py-2">{customer.location}</td>
                  <td className="px-4 py-2">{customer.contact}</td>
                  <td className="px-4 py-2">{formatTin(customer.tin)}</td>
                  <td className="px-4 py-2"><span className={customer.status ? 'sk-badge sk-badge-on' : 'sk-badge sk-badge-off'}>{customer.status ? 'Active' : 'Inactive'}</span></td>
                  <td className="px-4 py-2 text-right">
                    <Link href={`/settings/customers/${customer.id}/edit`} className="mr-3 sk-link">Edit</Link>
                    <form action={deleteCustomer.bind(null, String(customer.id))} className="inline">
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
