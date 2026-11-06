import Link from 'next/link'

import { requireAbility } from '@/lib/auth/guard'
import { calculateTotals } from '@/lib/pricing'
import { prisma } from '@/lib/prisma'
import { deleteProforma } from './actions'

export const instant = false

export default async function ProformasPage() {
  await requireAbility('proforma_list')

  const proformas = await prisma.proformas.findMany({
    orderBy: { id: 'desc' },
    include: { proforma_items: true },
  })

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Proformas</h1>
        <Link href="/documents/proformas/new" className="sk-btn">
          New proforma
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
            {proformas.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">No proformas yet.</td>
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
                      <Link href={`/documents/invoices/new?proforma=${proforma.id}`} className="sk-link mr-3">
                        Convert
                      </Link>
                      <Link href={`/documents/proformas/${proforma.id}/print`} className="sk-link mr-3">
                        Print
                      </Link>
                      <Link href={`/documents/proformas/${proforma.id}/edit`} className="sk-link mr-3">
                        Edit
                      </Link>
                      <form action={deleteProforma.bind(null, String(proforma.id))} className="inline">
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
