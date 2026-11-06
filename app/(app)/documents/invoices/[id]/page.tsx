import { notFound } from 'next/navigation'

import { DocumentActions, DocumentView } from '@/components/document-view'
import { requireAbility } from '@/lib/auth/guard'
import { formatPrintDate } from '@/lib/company'
import { calculateTotals } from '@/lib/pricing'
import { prisma } from '@/lib/prisma'
import { deleteInvoice } from '../actions'

export const instant = false

export default async function InvoiceViewPage({
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
    <DocumentView
      title="Tax invoice"
      number={invoice.notes ?? ''}
      actions={
        <DocumentActions
          editHref={`/documents/invoices/${invoice.id}/edit`}
          printHref={`/documents/invoices/${invoice.id}/print`}
          convertHref={`/documents/delivery-notes/new?invoice=${invoice.id}`}
          convertLabel="Convert to delivery note"
          deleteAction={deleteInvoice.bind(null, String(invoice.id))}
        />
      }
      summary={[
        { label: 'Customer', value: invoice.name },
        { label: 'Date', value: formatPrintDate(invoice.date) },
        { label: 'Currency', value: invoice.currency },
        { label: 'Purpose', value: invoice.for },
        ...(invoice.location ? [{ label: 'Location', value: invoice.location }] : []),
        ...(invoice.contact ? [{ label: 'Contact', value: invoice.contact }] : []),
        ...(invoice.tin ? [{ label: 'TIN', value: invoice.tin }] : []),
        ...(invoice.vrn ? [{ label: 'VRN', value: invoice.vrn }] : []),
      ]}
      columns={[
        { label: 'No' },
        { label: 'Item' },
        { label: 'Specification' },
        { label: 'Unit' },
        { label: 'Qty', align: 'right' },
        { label: 'Unit cost', align: 'right' },
        { label: 'Amount', align: 'right' },
      ]}
      rows={invoice.invoice_items.map((line, index) => [
        String(index + 1),
        line.items?.name ?? '',
        line.specification,
        line.unit_measure ?? '',
        String(line.quantity),
        Number(line.price).toLocaleString(),
        (Number(line.price) * line.quantity).toLocaleString(),
      ])}
      totals={[
        { label: 'Material cost', value: totals.subtotal.toLocaleString() },
        { label: 'Labour charge', value: totals.laborCharge.toLocaleString() },
        { label: `VAT (${Number(invoice.vat)}%)`, value: totals.vat.toLocaleString() },
        { label: 'Withholding', value: `-${totals.withholding.toLocaleString()}` },
        { label: 'Advance', value: `-${totals.advance.toLocaleString()}` },
        { label: 'Discount', value: `-${totals.discount.toLocaleString()}` },
        { label: 'Total', value: `${totals.total.toLocaleString()} ${invoice.currency}`, bold: true },
      ]}
    />
  )
}
