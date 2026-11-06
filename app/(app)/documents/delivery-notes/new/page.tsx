import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { DeliveryNoteForm, type DeliveryNoteFormProps } from '../form'

export const instant = false

export default async function NewDeliveryNotePage({
  searchParams,
}: {
  searchParams: Promise<{ invoice?: string }>
}) {
  await requireAbility('dnote_store')

  const { invoice } = await searchParams

  let dnote: DeliveryNoteFormProps['dnote']
  if (invoice) {
    const source = await prisma.invoices.findUnique({
      where: { id: BigInt(invoice) },
      include: { invoice_items: true },
    })

    if (source) {
      dnote = {
        date: source.date.toISOString().slice(0, 10),
        name: source.name,
        postal: source.postal,
        location: source.location,
        contact: source.contact,
        tin: source.tin,
        vrn: source.vrn,
        lines: source.invoice_items.map((line) => ({
          item_id: String(line.item_id),
          description: line.specification,
          unit_measure: line.unit_measure ?? '',
          quantity: String(line.quantity),
          serial_no: '',
        })),
      }
    }
  }

  const items = await prisma.items.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
  })

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">New delivery note</h1>
      <DeliveryNoteForm
        dnote={dnote}
        items={items.map((item) => ({
          id: String(item.id),
          name: item.name,
          specification: item.specification,
          unit_measure: item.unit_measure,
        }))}
      />
    </main>
  )
}
