import { notFound } from 'next/navigation'

import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { DeliveryNoteForm } from '../../form'

export const instant = false

export default async function EditDeliveryNotePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await requireAbility('dnote_update')

  const note = await prisma.delivery_notes.findUnique({
    where: { id: BigInt(id) },
    include: { delivery_note_items: true },
  })

  if (!note) {
    notFound()
  }

  const items = await prisma.items.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
  })

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Edit delivery note</h1>
      <DeliveryNoteForm
        dnote={{
          id: String(note.id),
          date: note.date.toISOString().slice(0, 10),
          name: note.name,
          postal: note.postal,
          location: note.location,
          contact: note.contact,
          tin: note.tin,
          vrn: note.vrn,
          lines: note.delivery_note_items.map((line) => ({
            item_id: String(line.item_id),
            description: line.description,
            unit_measure: line.unit_measure ?? '',
            quantity: String(line.quantity),
            serial_no: line.serial_no ?? '',
          })),
        }}
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
