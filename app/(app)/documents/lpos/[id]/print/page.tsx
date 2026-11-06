import { notFound } from 'next/navigation'

import { PrintButton } from '@/components/print-button'
import { requireAbility } from '@/lib/auth/guard'
import { company } from '@/lib/company'
import { calculateTotals } from '@/lib/pricing'
import { prisma } from '@/lib/prisma'

export const instant = false

export default async function PrintLpoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await requireAbility('lpo_list')

  const lpo = await prisma.local_purchase_orders.findUnique({
    where: { id: BigInt(id) },
    include: { suppliers: true, local_purchase_order_items: { include: { items: true } } },
  })

  if (!lpo) {
    notFound()
  }

  const totals = calculateTotals(
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
  )

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-4 flex justify-end">
        <PrintButton />
      </div>

      <div className="print-document sk-card p-8 text-sm">
        <div className="flex justify-between border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-lg font-bold">{company.name}</h1>
            <p className="text-gray-500">{company.address}</p>
            <p className="text-gray-500">{company.contact}</p>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-bold">LOCAL PURCHASE ORDER</h2>
            <p className="font-medium">{lpo.reference_no}</p>
            <p className="text-gray-500">{lpo.date.toISOString().slice(0, 10)}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs uppercase text-gray-400">Supplier</p>
            <p className="font-medium">{lpo.suppliers?.name}</p>
            {lpo.suppliers?.location ? <p>{lpo.suppliers.location}</p> : null}
            {lpo.suppliers?.contacts ? <p>{lpo.suppliers.contacts}</p> : null}
            {lpo.suppliers?.tin ? <p>TIN: {lpo.suppliers.tin}</p> : null}
          </div>
          <div className="text-right">
            {lpo.for ? (
              <>
                <p className="text-xs uppercase text-gray-400">Purpose</p>
                <p>{lpo.for}</p>
              </>
            ) : null}
            {lpo.proforma_referenced ? (
              <p className="mt-2 text-gray-500">Proforma: {lpo.proforma_referenced}</p>
            ) : null}
          </div>
        </div>

        <table className="mt-6 w-full">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="py-2">Item</th>
              <th className="py-2">Specification</th>
              <th className="py-2 text-center">Qty</th>
              <th className="py-2 text-right">Price</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {lpo.local_purchase_order_items.map((line) => (
              <tr key={String(line.id)} className="border-b border-gray-100">
                <td className="py-2">{line.items?.name}</td>
                <td className="py-2">{line.specification}</td>
                <td className="py-2 text-center">{line.quantity}</td>
                <td className="py-2 text-right">{Number(line.price).toLocaleString()}</td>
                <td className="py-2 text-right">
                  {(Number(line.price) * line.quantity).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex justify-end">
          <div className="w-64 space-y-1">
            <div className="flex justify-between"><span>Subtotal</span><span>{totals.subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between"><span>VAT ({Number(lpo.vat)}%)</span><span>{totals.vat.toLocaleString()}</span></div>
            <div className="flex justify-between"><span>Withholding</span><span>{totals.withholding.toLocaleString()}</span></div>
            <div className="flex justify-between border-t border-gray-200 pt-1 font-bold"><span>Total</span><span>{totals.total.toLocaleString()}</span></div>
          </div>
        </div>

        {lpo.extra_notes ? (
          <p className="mt-6 text-xs text-gray-500">Notes: {lpo.extra_notes}</p>
        ) : null}

        <p className="mt-8 border-t border-gray-200 pt-4 text-xs text-gray-500">
          {company.name} · {company.address} · {company.contact}
        </p>
      </div>
    </div>
  )
}
