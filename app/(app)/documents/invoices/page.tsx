import Link from 'next/link'

import { ClickableRow } from '@/components/clickable-row'
import { Pagination } from '@/components/pagination'
import { RowActions } from '@/components/row-actions'
import { SearchForm } from '@/components/search-form'
import { requireAbility } from '@/lib/auth/guard'
import { calculateTotals } from '@/lib/pricing'
import { prisma } from '@/lib/prisma'
import { deleteInvoice } from './actions'

export const instant = false

const PAGE_SIZE = 15

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  await requireAbility('invoice_list')

  const { q = '', page = '1' } = await searchParams
  const pageNum = Math.max(1, Number(page) || 1)
  const where = q
    ? { OR: [{ name: { contains: q } }, { notes: { contains: q } }] }
    : undefined

  const [invoices, total] = await Promise.all([
    prisma.invoices.findMany({
      where,
      orderBy: { id: 'desc' },
      skip: (pageNum - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { invoice_items: true },
    }),
    prisma.invoices.count({ where }),
  ])

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Invoices</h1>
        <Link href="/documents/invoices/new" className="sk-btn">
          New invoice
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
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">No invoices found.</td>
              </tr>
            ) : (
              invoices.map((invoice) => {
                const total = calculateTotals(
                  invoice.invoice_items.map((line) => ({
                    price: Number(line.price),
                    quantity: line.quantity,
                  })),
                  {
                    vatRate: Number(invoice.vat) / 100,
                    withholdingRate: Number(invoice.withholding_tax) / 100,
                    laborCharge: Number(invoice.labor_charge),
                    discount: Number(invoice.discount),
                  },
                ).total

                return (
                  <ClickableRow key={String(invoice.id)} href={`/documents/invoices/${invoice.id}/edit`}>
                    <td className="px-4 py-2 font-medium">{invoice.notes}</td>
                    <td className="px-4 py-2">{invoice.name}</td>
                    <td className="px-4 py-2">{invoice.date.toISOString().slice(0, 10)}</td>
                    <td className="px-4 py-2 text-right">{total.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right">
                      <RowActions
                        actions={[
                          {
                            kind: 'link',
                            label: 'Print',
                            icon: 'print',
                            href: `/documents/invoices/${invoice.id}/print`,
                          },
                          {
                            kind: 'link',
                            label: 'Edit',
                            icon: 'edit',
                            href: `/documents/invoices/${invoice.id}/edit`,
                          },
                          {
                            kind: 'submit',
                            label: 'Delete',
                            icon: 'trash',
                            danger: true,
                            submit: deleteInvoice,
                            id: String(invoice.id),
                          },
                        ]}
                      />
                    </td>
                  </ClickableRow>
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
