import { notFound } from 'next/navigation'

import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { InvoiceForm } from '../../form'

export const instant = false

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await requireAbility('invoice_update')

  const invoice = await prisma.invoices.findUnique({
    where: { id: BigInt(id) },
    include: { invoice_items: true },
  })

  if (!invoice) {
    notFound()
  }

  const items = await prisma.items.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
  })

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Edit invoice</h1>
      <InvoiceForm
        invoice={{
          id: String(invoice.id),
          name: invoice.name,
          date: invoice.date.toISOString().slice(0, 10),
          currency: invoice.currency,
          exchange_rate: Number(invoice.exchange_rate),
          labor_charge: Number(invoice.labor_charge),
          vat: Number(invoice.vat),
          withholding_tax: Number(invoice.withholding_tax),
          advance: Number(invoice.advance),
          discount: Number(invoice.discount),
          for: invoice.for,
          contact: invoice.contact,
          location: invoice.location,
          postal: invoice.postal,
          tin: invoice.tin,
          vrn: invoice.vrn,
          lines: invoice.invoice_items.map((line) => ({
            item_id: String(line.item_id),
            specification: line.specification,
            unit_measure: line.unit_measure ?? '',
            quantity: String(line.quantity),
            price: String(line.price),
          })),
        }}
        items={items.map((item) => ({
          id: String(item.id),
          name: item.name,
          specification: item.specification,
          unit_measure: item.unit_measure,
          price: Number(item.price),
        }))}
      />
    </main>
  )
}
