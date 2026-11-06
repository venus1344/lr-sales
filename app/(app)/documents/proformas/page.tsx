import Link from 'next/link'

import { IconConvert, IconEdit, IconPrint, IconTrash } from '@/components/icons'
import { Pagination } from '@/components/pagination'
import { SearchForm } from '@/components/search-form'
import { ActionButton, ActionLink } from '@/components/table-actions'
import { requireAbility } from '@/lib/auth/guard'
import { calculateTotals } from '@/lib/pricing'
import { prisma } from '@/lib/prisma'
import { deleteProforma } from './actions'

export const instant = false

const PAGE_SIZE = 15

export default async function ProformasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  await requireAbility('proforma_list')

  const { q = '', page = '1' } = await searchParams
  const pageNum = Math.max(1, Number(page) || 1)
  const where = q
    ? { OR: [{ name: { contains: q } }, { notes: { contains: q } }] }
    : undefined

  const [proformas, total] = await Promise.all([
    prisma.proformas.findMany({
      where,
      orderBy: { id: 'desc' },
      skip: (pageNum - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { proforma_items: true },
    }),
    prisma.proformas.count({ where }),
  ])

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Proformas</h1>
        <Link href="/documents/proformas/new" className="sk-btn">
          New proforma
        </Link>
      </div>

      <div className="mt-4">
        <SearchForm placeholder="Search by number or customer…" defaultValue={q} />
      </div>

      <div className="sk-card mt-4 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="sk-table-head text-left">
              <th className="px-4 py-2">Number</th>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2 text-right">Total</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {proformas.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">No proformas found.</td>
              </tr>
            ) : (
              proformas.map((proforma) => {
                const total = calculateTotals(
                  proforma.proforma_items.map((line) => ({
                    price: Number(line.price),
                    quantity: line.quantity,
                  })),
                  {
                    vatRate: Number(proforma.vat) / 100,
                    withholdingRate: Number(proforma.withholding_tax ?? 0) / 100,
                    laborCharge: Number(proforma.labor_charge),
                    discount: 0,
                  },
                ).total

                return (
                  <tr key={String(proforma.id)} className="border-b last:border-0">
                    <td className="px-4 py-2 font-medium">{proforma.notes}</td>
                    <td className="px-4 py-2">{proforma.name}</td>
                    <td className="px-4 py-2">{proforma.date.toISOString().slice(0, 10)}</td>
                    <td className="px-4 py-2 text-right">{total.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right">
                      <ActionLink
                        href={`/documents/invoices/new?proforma=${proforma.id}`}
                        icon={IconConvert}
                        label="Convert"
                      />
                      <ActionLink
                        href={`/documents/proformas/${proforma.id}/print`}
                        icon={IconPrint}
                        label="Print"
                      />
                      <ActionLink
                        href={`/documents/proformas/${proforma.id}/edit`}
                        icon={IconEdit}
                        label="Edit"
                      />
                      <form action={deleteProforma.bind(null, String(proforma.id))} className="inline">
                        <ActionButton icon={IconTrash} label="Delete" danger />
                      </form>
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
