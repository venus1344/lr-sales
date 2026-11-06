import Link from 'next/link'

import { ClickableRow } from '@/components/clickable-row'
import { Pagination } from '@/components/pagination'
import { SearchForm } from '@/components/search-form'
import { formatTin } from '@/lib/format'
import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'

export const instant = false

const PAGE_SIZE = 15

export default async function SuppliersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  await requireAbility('supplier_list')

  const { q = '', page = '1' } = await searchParams
  const pageNum = Math.max(1, Number(page) || 1)
  const where = q ? { name: { contains: q } } : undefined

  const [suppliers, total] = await Promise.all([
    prisma.suppliers.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: (pageNum - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.suppliers.count({ where }),
  ])

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Suppliers</h1>
        <Link href="/settings/suppliers/new" className="sk-btn">New supplier</Link>
      </div>

      <div className="mt-4">
        <SearchForm placeholder="Search suppliers…" defaultValue={q} />
      </div>

      <div className="sk-card mt-4 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="sk-table-head text-left">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Location</th>
              <th className="px-4 py-2">Contacts</th>
              <th className="px-4 py-2">TIN</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">No suppliers found.</td>
              </tr>
            ) : (
              suppliers.map((supplier) => (
                <ClickableRow key={String(supplier.id)} href={`/settings/suppliers/${supplier.id}`}>
                  <td className="px-4 py-2 font-medium">{supplier.name}</td>
                  <td className="px-4 py-2">{supplier.location}</td>
                  <td className="px-4 py-2">{supplier.contacts}</td>
                  <td className="px-4 py-2">{formatTin(supplier.tin)}</td>
                  <td className="px-4 py-2">{supplier.status ? 'Active' : 'Inactive'}</td>
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
