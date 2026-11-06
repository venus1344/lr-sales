import { notFound } from 'next/navigation'

import { PrintButton } from '@/components/print-button'
import { PrintDocument } from '@/components/print-document'
import { PrintDetails, PrintFooter, PrintHeader, PrintPurpose } from '@/components/print-layout'
import { requireAbility } from '@/lib/auth/guard'
import { formatPrintDate } from '@/lib/company'
import { formatTin, formatVrn } from '@/lib/format'
import { calculateTotals } from '@/lib/pricing'
import { prisma } from '@/lib/prisma'

export const instant = false

export default async function PrintProformaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await requireAbility('proforma_list')

  const proforma = await prisma.proformas.findUnique({
    where: { id: BigInt(id) },
    include: { proforma_items: { include: { items: true } } },
  })

  if (!proforma) {
    notFound()
  }

  const totals = calculateTotals(
    proforma.proforma_items.map((line) => ({ price: Number(line.price), quantity: line.quantity })),
    {
      vatRate: Number(proforma.vat) / 100,
      withholdingRate: Number(proforma.withholding_tax ?? 0) / 100,
      laborCharge: Number(proforma.labor_charge),
      discount: 0,
      advance: Number(proforma.advance),
    },
  )

  return (
    <div className="print-page">
      <div className="no-print mb-3 flex justify-end">
        <PrintButton />
      </div>

      <PrintDocument>
        <PrintHeader
          documentType="Proforma Invoice"
          number={proforma.notes ?? ''}
          date={formatPrintDate(proforma.date)}
        />

        <PrintDetails
          heading="Customer"
          lines={[
            proforma.name,
            proforma.postal
              ? `BOX ${proforma.postal}, ${proforma.location ?? ''}`
              : proforma.location,
            proforma.contact,
            formatTin(proforma.tin) ? `TIN: ${formatTin(proforma.tin)}` : null,
            formatVrn(proforma.vrn) ? `VRN: ${formatVrn(proforma.vrn)}` : null,
          ]}
        />

        <PrintPurpose purpose={proforma.for} />

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
            {proforma.proforma_items.map((line, index) => (
              <tr key={String(line.id)}>
                <td className="border px-1 py-1">{index + 1}</td>
                <td className="border px-1 py-1">{line.items?.name}</td>
                <td className="border px-1 py-1">{line.specification}</td>
                <td className="border px-1 py-1">{line.unit_measure}</td>
                <td className="border px-1 py-1 text-right">{line.quantity}</td>
                <td className="border px-1 py-1 text-right">{Number(line.price).toLocaleString()}</td>
                <td className="border px-1 py-1 text-right">
                  {(Number(line.price) * line.quantity).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <PrintFooter showBank showTotals totals={totals} currency={proforma.currency} />
      </PrintDocument>
    </div>
  )
}
