import Link from 'next/link'

import { ClickableRow } from '@/components/clickable-row'
import { Pagination } from '@/components/pagination'
import { RowActions } from '@/components/row-actions'
import { SearchForm } from '@/components/search-form'
import { formatTin } from '@/lib/format'
import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { deleteCustomer } from './actions'

export const instant = false

const PAGE_SIZE = 15

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  await requireAbility('customer_list')

  const { q = '', page = '1' } = await searchParams
  const pageNum = Math.max(1, Number(page) || 1)
  const where = q ? { name: { contains: q } } : undefined

  const [customers, total] = await Promise.all([
    prisma.customers.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: (pageNum - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.customers.count({ where }),
  ])

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Customers</h1>
        <Link href="/settings/customers/new" className="sk-btn">New customer</Link>
      </div>

      <div className="mt-4">
        <SearchForm placeholder="Search customers…" defaultValue={q} />
      </div>

      <div className="sk-card mt-4 overflow-hidden">
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
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">No customers found.</td>
              </tr>
            ) : (
              customers.map((customer) => (
                <ClickableRow key={String(customer.id)} href={`/settings/customers/${customer.id}/edit`}>
                  <td className="px-4 py-2 font-medium">{customer.name}</td>
                  <td className="px-4 py-2">{customer.location}</td>
                  <td className="px-4 py-2">{customer.contact}</td>
                  <td className="px-4 py-2">{formatTin(customer.tin)}</td>
                  <td className="px-4 py-2">{customer.status ? 'Active' : 'Inactive'}</td>
                  <td className="px-4 py-2 text-right">
                    <RowActions
                      actions={[
                        {
                          kind: 'link',
                          label: 'Edit',
                          icon: 'edit',
                          href: `/settings/customers/${customer.id}/edit`,
                        },
                        {
                          kind: 'submit',
                          label: 'Delete',
                          icon: 'trash',
                          danger: true,
                          submit: deleteCustomer,
                          id: String(customer.id),
                        },
                      ]}
                    />
                  </td>
                </ClickableRow>
              ))
            )}
          </tbody>
        </table>
        <Pagination page={pageNum} total={total} pageSize={PAGE_SIZE} query={q} />
      </div>
    </main>
  )
}
