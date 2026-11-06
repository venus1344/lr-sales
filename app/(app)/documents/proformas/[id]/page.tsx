import { notFound } from 'next/navigation'

import { DocumentActions, DocumentView } from '@/components/document-view'
import { requireAbility } from '@/lib/auth/guard'
import { formatPrintDate } from '@/lib/company'
import { calculateTotals } from '@/lib/pricing'
import { prisma } from '@/lib/prisma'
import { deleteProforma } from '../actions'

export const instant = false

export default async function ProformaViewPage({
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
    <DocumentView
      title="Proforma invoice"
      number={proforma.notes ?? ''}
      actions={
        <DocumentActions
          editHref={`/documents/proformas/${proforma.id}/edit`}
          printHref={`/documents/proformas/${proforma.id}/print`}
          convertHref={`/documents/invoices/new?proforma=${proforma.id}`}
          deleteAction={deleteProforma.bind(null, String(proforma.id))}
        />
      }
      summary={[
        { label: 'Customer', value: proforma.name },
        { label: 'Date', value: formatPrintDate(proforma.date) },
        { label: 'Currency', value: proforma.currency },
        { label: 'Purpose', value: proforma.for },
        ...(proforma.location ? [{ label: 'Location', value: proforma.location }] : []),
        ...(proforma.contact ? [{ label: 'Contact', value: proforma.contact }] : []),
        ...(proforma.tin ? [{ label: 'TIN', value: proforma.tin }] : []),
        ...(proforma.vrn ? [{ label: 'VRN', value: proforma.vrn }] : []),
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
      rows={proforma.proforma_items.map((line, index) => [
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
        { label: `VAT (${Number(proforma.vat)}%)`, value: totals.vat.toLocaleString() },
        { label: 'Withholding', value: `-${totals.withholding.toLocaleString()}` },
        { label: 'Advance', value: `-${totals.advance.toLocaleString()}` },
        { label: 'Discount', value: `-${totals.discount.toLocaleString()}` },
        { label: 'Total', value: `${totals.total.toLocaleString()} ${proforma.currency}`, bold: true },
      ]}
    />
  )
}
