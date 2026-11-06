import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { InvoiceForm, type InvoiceFormProps } from '../form'

export const instant = false

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ proforma?: string }>
}) {
  await requireAbility('invoice_store')

  const { proforma } = await searchParams

  let invoice: InvoiceFormProps['invoice']
  let proformaId: string | undefined

  if (proforma) {
    const source = await prisma.proformas.findUnique({
      where: { id: BigInt(proforma) },
      include: { proforma_items: true },
    })

    if (source) {
      proformaId = proforma
      invoice = {
        name: source.name,
        date: source.date.toISOString().slice(0, 10),
        currency: source.currency,
        exchange_rate: Number(source.exchange_rate),
        labor_charge: Number(source.labor_charge),
        vat: Number(source.vat),
        withholding_tax: Number(source.withholding_tax ?? 0),
        advance: Number(source.advance),
        discount: 0,
        for: source.for,
        contact: source.contact,
        location: source.location,
        postal: source.postal,
        tin: source.tin,
        vrn: source.vrn,
        lines: source.proforma_items.map((line) => ({
          item_id: String(line.item_id),
          specification: line.specification,
          unit_measure: line.unit_measure ?? '',
          quantity: String(line.quantity),
          price: String(line.price),
        })),
      }
    }
  }

  const items = await prisma.items.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
  })

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">New invoice</h1>
      <InvoiceForm
        invoice={invoice}
        proformaId={proformaId}
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
