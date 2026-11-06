import Link from 'next/link'

import { Pagination } from '@/components/pagination'
import { RowActions } from '@/components/row-actions'
import { SearchForm } from '@/components/search-form'
import { requireAbility } from '@/lib/auth/guard'
import { calculateTotals } from '@/lib/pricing'
import { prisma } from '@/lib/prisma'
import { deleteLpo } from './actions'

export const instant = false

const PAGE_SIZE = 15

export default async function LposPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  await requireAbility('lpo_list')

  const { q = '', page = '1' } = await searchParams
  const pageNum = Math.max(1, Number(page) || 1)
  const where = q
    ? { OR: [{ reference_no: { contains: q } }, { suppliers: { name: { contains: q } } }] }
    : undefined

  const [lpos, total] = await Promise.all([
    prisma.local_purchase_orders.findMany({
      where,
      orderBy: { id: 'desc' },
      skip: (pageNum - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { suppliers: true, local_purchase_order_items: true },
    }),
    prisma.local_purchase_orders.count({ where }),
  ])

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Local purchase orders</h1>
        <Link href="/documents/lpos/new" className="sk-btn">
          New LPO
        </Link>
      </div>

      <div className="mt-4">
        <SearchForm placeholder="Search by reference or supplier…" defaultValue={q} />
      </div>

      <div className="sk-card mt-4 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="sk-table-head text-left">
              <th className="px-4 py-2">Reference</th>
              <th className="px-4 py-2">Supplier</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2 text-right">Total</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {lpos.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">No LPOs found.</td>
              </tr>
            ) : (
              lpos.map((lpo) => {
                const total = calculateTotals(
                  lpo.local_purchase_order_items.map((line) => ({
                    price: Number(line.price),
                    quantity: line.quantity,
                  })),
                  {
                    vatRate: Number(lpo.vat) / 100,
                    withholdingRate: Number(lpo.withholding_tax) / 100,
                    laborCharge: 0,
                    discount: 0,
                  },
                ).total

                return (
                  <tr key={String(lpo.id)} className="border-b last:border-0">
                    <td className="px-4 py-2 font-medium">{lpo.reference_no}</td>
                    <td className="px-4 py-2">{lpo.suppliers?.name}</td>
                    <td className="px-4 py-2">{lpo.date.toISOString().slice(0, 10)}</td>
                    <td className="px-4 py-2 text-right">{total.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right">
                      <RowActions
                        actions={[
                          {
                            kind: 'link',
                            label: 'Print',
                            icon: 'print',
                            href: `/documents/lpos/${lpo.id}/print`,
                          },
                          {
                            kind: 'link',
                            label: 'Edit',
                            icon: 'edit',
                            href: `/documents/lpos/${lpo.id}/edit`,
                          },
                          {
                            kind: 'submit',
                            label: 'Delete',
                            icon: 'trash',
                            danger: true,
                            submit: deleteLpo,
                            id: String(lpo.id),
                          },
                        ]}
                      />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
        <Pagination page={pageNum} total={total} pageSize={PAGE_SIZE} query={q} />
      </div>
    </main>
  )
}
