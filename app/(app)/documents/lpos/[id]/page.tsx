import { notFound } from 'next/navigation'

import { DocumentActions, DocumentView } from '@/components/document-view'
import { requireAbility } from '@/lib/auth/guard'
import { formatPrintDate } from '@/lib/company'
import { calculateTotals } from '@/lib/pricing'
import { prisma } from '@/lib/prisma'
import { deleteLpo } from '../actions'

export const instant = false

export default async function LpoViewPage({
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
    <DocumentView
      title="Local purchase order"
      number={lpo.reference_no ?? ''}
      actions={
        <DocumentActions
          editHref={`/documents/lpos/${lpo.id}/edit`}
          printHref={`/documents/lpos/${lpo.id}/print`}
          deleteAction={deleteLpo.bind(null, String(lpo.id))}
        />
      }
      summary={[
        { label: 'Supplier', value: lpo.suppliers?.name ?? '' },
        { label: 'Date', value: formatPrintDate(lpo.date) },
        { label: 'Currency', value: lpo.currency },
        ...(lpo.for ? [{ label: 'Purpose', value: lpo.for }] : []),
        ...(lpo.suppliers?.location ? [{ label: 'Location', value: lpo.suppliers.location }] : []),
        ...(lpo.suppliers?.contacts ? [{ label: 'Contacts', value: lpo.suppliers.contacts }] : []),
        ...(lpo.proforma_referenced ? [{ label: 'Proforma referenced', value: lpo.proforma_referenced }] : []),
        ...(lpo.extra_notes ? [{ label: 'Notes', value: lpo.extra_notes }] : []),
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
      rows={lpo.local_purchase_order_items.map((line, index) => [
        String(index + 1),
        line.items?.name ?? '',
        line.specification,
        line.items?.unit_measure ?? '',
        String(line.quantity),
        Number(line.price).toLocaleString(),
        (Number(line.price) * line.quantity).toLocaleString(),
      ])}
      totals={[
        { label: 'Material cost', value: totals.subtotal.toLocaleString() },
        { label: `VAT (${Number(lpo.vat)}%)`, value: totals.vat.toLocaleString() },
        { label: 'Withholding', value: `-${totals.withholding.toLocaleString()}` },
        { label: 'Total', value: `${totals.total.toLocaleString()} ${lpo.currency}`, bold: true },
      ]}
    />
  )
}
