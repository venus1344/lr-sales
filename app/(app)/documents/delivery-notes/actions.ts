'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { deliveryNoteSchema } from '@/lib/validation/delivery-note'

export type DeliveryNoteFormState = { error?: string }

function readInput(formData: FormData) {
  const optional = (key: string) => String(formData.get(key) ?? '').trim() || null

  let lines: unknown
  try {
    lines = JSON.parse(String(formData.get('lines') ?? '[]'))
  } catch {
    lines = []
  }

  return {
    date: formData.get('date'),
    name: formData.get('name'),
    postal: optional('postal'),
    location: optional('location'),
    contact: optional('contact'),
    tin: optional('tin'),
    vrn: optional('vrn'),
    lines,
  }
}

export async function createDeliveryNote(
  _prev: DeliveryNoteFormState,
  formData: FormData,
): Promise<DeliveryNoteFormState> {
  const session = await requireAbility('dnote_store')

  const result = deliveryNoteSchema.safeParse(readInput(formData))
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid input' }
  }

  const input = result.data

  await prisma.delivery_notes.create({
    data: {
      date: input.date,
      name: input.name,
      postal: input.postal,
      location: input.location,
      contact: input.contact,
      tin: input.tin,
      vrn: input.vrn,
      created_by: BigInt(session.user.id),
      delivery_note_items: {
        create: input.lines.map((line) => ({
          item_id: BigInt(line.item_id),
          description: line.description,
          unit_measure: line.unit_measure,
          quantity: line.quantity,
          serial_no: line.serial_no,
          created_by: BigInt(session.user.id),
        })),
      },
    },
  })

  revalidatePath('/documents/delivery-notes')
  redirect('/documents/delivery-notes')
}

export async function updateDeliveryNote(
  id: string,
  _prev: DeliveryNoteFormState,
  formData: FormData,
): Promise<DeliveryNoteFormState> {
  const session = await requireAbility('dnote_update')

  const result = deliveryNoteSchema.safeParse(readInput(formData))
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid input' }
  }

  const input = result.data

  await prisma.$transaction([
    prisma.delivery_note_items.deleteMany({ where: { dnote_id: BigInt(id) } }),
    prisma.delivery_notes.update({
      where: { id: BigInt(id) },
      data: {
        date: input.date,
        name: input.name,
        postal: input.postal,
        location: input.location,
        contact: input.contact,
        tin: input.tin,
        vrn: input.vrn,
        updated_by: BigInt(session.user.id),
        delivery_note_items: {
          create: input.lines.map((line) => ({
            item_id: BigInt(line.item_id),
            description: line.description,
            unit_measure: line.unit_measure,
            quantity: line.quantity,
            serial_no: line.serial_no,
            created_by: BigInt(session.user.id),
          })),
        },
      },
    }),
  ])

  revalidatePath('/documents/delivery-notes')
  redirect('/documents/delivery-notes')
}

export async function deleteDeliveryNote(id: string): Promise<void> {
  await requireAbility('dnote_remove')

  await prisma.delivery_notes.delete({ where: { id: BigInt(id) } })

  revalidatePath('/documents/delivery-notes')
  redirect('/documents/delivery-notes')
}
