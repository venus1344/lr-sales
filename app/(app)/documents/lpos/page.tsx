import Link from 'next/link'

import { requireAbility } from '@/lib/auth/guard'
import { calculateTotals } from '@/lib/pricing'
import { prisma } from '@/lib/prisma'
import { deleteLpo } from './actions'

export const instant = false

export default async function LposPage() {
  await requireAbility('lpo_list')

  const lpos = await prisma.local_purchase_orders.findMany({
    orderBy: { id: 'desc' },
    include: { suppliers: true, local_purchase_order_items: true },
  })

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Local purchase orders</h1>
        <Link href="/documents/lpos/new" className="sk-btn">
          New LPO
        </Link>
      </div>

      <div className="sk-card mt-6 overflow-hidden">
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
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">No LPOs yet.</td>
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
                      <Link href={`/documents/lpos/${lpo.id}/print`} className="sk-link mr-3">
                        Print
                      </Link>
                      <Link href={`/documents/lpos/${lpo.id}/edit`} className="sk-link mr-3">
                        Edit
                      </Link>
                      <form action={deleteLpo.bind(null, String(lpo.id))} className="inline">
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
