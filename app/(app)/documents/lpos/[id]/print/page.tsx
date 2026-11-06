import { notFound } from 'next/navigation'

import { PrintButton } from '@/components/print-button'
import { PrintDetails, PrintFooter, PrintHeader, PrintPurpose } from '@/components/print-layout'
import { requireAbility } from '@/lib/auth/guard'
import { formatPrintDate } from '@/lib/company'
import { formatTin } from '@/lib/format'
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
        <PrintHeader
          documentType="Local Purchase Order"
          number={lpo.reference_no ?? ''}
          date={formatPrintDate(lpo.date)}
        />

        <PrintDetails
          heading="Supplier"
          lines={[
            lpo.suppliers?.name ?? null,
            lpo.suppliers?.location ?? null,
            lpo.suppliers?.contacts ?? null,
            lpo.suppliers?.tin ? `TIN: ${formatTin(lpo.suppliers.tin)}` : null,
          ]}
        />

        <PrintPurpose purpose={lpo.for} />

        <table className="print-items w-full border-collapse text-[9px]">
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th className="border px-1 py-1 text-left">No</th>
              <th className="border px-1 py-1 text-left">Item Name</th>
              <th className="border px-1 py-1 text-left">Description</th>
              <th className="border px-1 py-1 text-left">Unit Measure</th>
              <th className="border px-1 py-1 text-right">Quantity</th>
              <th className="border px-1 py-1 text-right">Unit Cost</th>
              <th className="border px-1 py-1 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {lpo.local_purchase_order_items.map((line, index) => (
              <tr key={String(line.id)}>
                <td className="border px-1 py-1">{index + 1}</td>
                <td className="border px-1 py-1">{line.items?.name}</td>
                <td className="border px-1 py-1">{line.specification}</td>
                <td className="border px-1 py-1">{line.items?.unit_measure}</td>
                <td className="border px-1 py-1 text-right">{line.quantity}</td>
                <td className="border px-1 py-1 text-right">{Number(line.price).toLocaleString()}</td>
                <td className="border px-1 py-1 text-right">
                  {(Number(line.price) * line.quantity).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {lpo.extra_notes ? (
          <p className="mt-2 text-[9px] text-gray-600">Notes: {lpo.extra_notes}</p>
        ) : null}
        {lpo.proforma_referenced ? (
          <p className="text-[9px] text-gray-600">Proforma: {lpo.proforma_referenced}</p>
        ) : null}

        <PrintFooter showTotals totals={totals} currency={lpo.currency} />
      </div>
    </div>
  )
}
