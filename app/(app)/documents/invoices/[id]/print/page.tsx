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

export default async function PrintInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await requireAbility('invoice_list')

  const invoice = await prisma.invoices.findUnique({
    where: { id: BigInt(id) },
    include: { invoice_items: { include: { items: true } } },
  })

  if (!invoice) {
    notFound()
  }

  const totals = calculateTotals(
    invoice.invoice_items.map((line) => ({ price: Number(line.price), quantity: line.quantity })),
    {
      vatRate: Number(invoice.vat) / 100,
      withholdingRate: Number(invoice.withholding_tax) / 100,
      laborCharge: Number(invoice.labor_charge),
      discount: Number(invoice.discount),
      advance: Number(invoice.advance),
    },
  )

  return (
    <div className="print-page">
      <div className="no-print mb-3 flex justify-end">
        <PrintButton />
      </div>

      <PrintDocument>
        <PrintHeader
          documentType="Tax Invoice"
          number={invoice.notes ?? ''}
          date={formatPrintDate(invoice.date)}
        />

        <PrintDetails
          heading="Customer"
          lines={[
            invoice.name,
            invoice.postal
              ? `BOX ${invoice.postal}, ${invoice.location ?? ''}`
              : invoice.location,
            invoice.contact,
            formatTin(invoice.tin) ? `TIN: ${formatTin(invoice.tin)}` : null,
            formatVrn(invoice.vrn) ? `VRN: ${formatVrn(invoice.vrn)}` : null,
          ]}
        />

        <PrintPurpose purpose={invoice.for} />

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
            {invoice.invoice_items.map((line, index) => (
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

        <PrintFooter showBank showTotals totals={totals} currency={invoice.currency} />
      </PrintDocument>
    </div>
  )
}
