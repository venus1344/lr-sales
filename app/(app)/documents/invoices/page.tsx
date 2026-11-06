import Link from 'next/link'

import { requireAbility } from '@/lib/auth/guard'
import { calculateTotals } from '@/lib/pricing'
import { prisma } from '@/lib/prisma'
import { deleteInvoice } from './actions'

export const instant = false

export default async function InvoicesPage() {
  await requireAbility('invoice_list')

  const invoices = await prisma.invoices.findMany({
    orderBy: { id: 'desc' },
    include: { invoice_items: true },
  })

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Invoices</h1>
        <Link href="/documents/invoices/new" className="sk-btn">
          New invoice
        </Link>
      </div>

      <div className="sk-card mt-6 overflow-hidden">
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
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">No invoices yet.</td>
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
                  <tr key={String(invoice.id)} className="border-b last:border-0">
                    <td className="px-4 py-2 font-medium">{invoice.notes}</td>
                    <td className="px-4 py-2">{invoice.name}</td>
                    <td className="px-4 py-2">{invoice.date.toISOString().slice(0, 10)}</td>
                    <td className="px-4 py-2 text-right">{total.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right">
                      <Link href={`/documents/invoices/${invoice.id}/edit`} className="sk-link mr-3">
                        Edit
                      </Link>
                      <form action={deleteInvoice.bind(null, String(invoice.id))} className="inline">
                        <button type="submit" className="sk-link-danger">Delete</button>
                      </form>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}
