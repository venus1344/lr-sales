import { notFound } from 'next/navigation'

import { DocumentActions, DocumentView } from '@/components/document-view'
import { requireAbility } from '@/lib/auth/guard'
import { formatPrintDate } from '@/lib/company'
import { prisma } from '@/lib/prisma'
import { deleteDeliveryNote } from '../actions'

export const instant = false

export default async function DeliveryNoteViewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await requireAbility('dnote_list')

  const note = await prisma.delivery_notes.findUnique({
    where: { id: BigInt(id) },
    include: { delivery_note_items: { include: { items: true } } },
  })

  if (!note) {
    notFound()
  }

  return (
    <DocumentView
      title="Delivery note"
      number={`#${note.id}`}
      actions={
        <DocumentActions
          editHref={`/documents/delivery-notes/${note.id}/edit`}
          printHref={`/documents/delivery-notes/${note.id}/print`}
          deleteAction={deleteDeliveryNote.bind(null, String(note.id))}
        />
      }
      summary={[
        { label: 'Customer', value: note.name },
        { label: 'Date', value: formatPrintDate(note.date) },
        ...(note.location ? [{ label: 'Location', value: note.location }] : []),
        ...(note.contact ? [{ label: 'Contact', value: note.contact }] : []),
        ...(note.postal ? [{ label: 'Postal address', value: note.postal }] : []),
        ...(note.tin ? [{ label: 'TIN', value: note.tin }] : []),
        ...(note.vrn ? [{ label: 'VRN', value: note.vrn }] : []),
      ]}
      columns={[
        { label: 'No' },
        { label: 'Item' },
        { label: 'Description' },
        { label: 'Unit' },
        { label: 'Qty', align: 'right' },
        { label: 'Serial no' },
      ]}
      rows={note.delivery_note_items.map((line, index) => [
        String(index + 1),
        line.items?.name ?? '',
        line.description,
        line.unit_measure ?? '',
        String(line.quantity),
        line.serial_no ?? '',
      ])}
    />
  )
}
