import { notFound } from 'next/navigation'

import { PrintButton } from '@/components/print-button'
import { PrintDocument } from '@/components/print-document'
import { PrintDetails, PrintFooter, PrintHeader } from '@/components/print-layout'
import { requireAbility } from '@/lib/auth/guard'
import { formatPrintDate } from '@/lib/company'
import { formatTin, formatVrn } from '@/lib/format'
import { prisma } from '@/lib/prisma'

export const instant = false

export default async function PrintDeliveryNotePage({
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
    <div className="print-page">
      <div className="no-print mb-3 flex justify-end">
        <PrintButton />
      </div>

      <PrintDocument>
        <PrintHeader
          documentType="Delivery Note"
          number=""
          date={formatPrintDate(note.date)}
        />

        <PrintDetails
          heading="Deliver to"
          lines={[
            note.name,
            note.postal
              ? `BOX ${note.postal}, ${note.location ?? ''}`
              : note.location,
            note.contact,
            formatTin(note.tin) ? `TIN: ${formatTin(note.tin)}` : null,
            formatVrn(note.vrn) ? `VRN: ${formatVrn(note.vrn)}` : null,
          ]}
        />

        <table className="print-items w-full border-collapse text-[9px]">
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th className="border px-1 py-1 text-left">No</th>
              <th className="border px-1 py-1 text-left">Item Name</th>
              <th className="border px-1 py-1 text-left">Description</th>
              <th className="border px-1 py-1 text-left">Unit Measure</th>
              <th className="border px-1 py-1 text-right">Quantity</th>
              <th className="border px-1 py-1 text-left">Serial No</th>
            </tr>
          </thead>
          <tbody>
            {note.delivery_note_items.map((line, index) => (
              <tr key={String(line.id)}>
                <td className="border px-1 py-1">{index + 1}</td>
                <td className="border px-1 py-1">{line.items?.name}</td>
                <td className="border px-1 py-1">{line.description}</td>
                <td className="border px-1 py-1">{line.unit_measure}</td>
                <td className="border px-1 py-1 text-right">{line.quantity}</td>
                <td className="border px-1 py-1">{line.serial_no}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 grid grid-cols-2 gap-8 text-[9px]">
          <div>
            <p className="mb-6">Received by (name &amp; signature):</p>
            <div className="border-t border-gray-300 pt-1">Signature</div>
          </div>
          <div>
            <p className="mb-6">Delivered by:</p>
            <div className="border-t border-gray-300 pt-1">Signature</div>
          </div>
        </div>

        <PrintFooter />
      </PrintDocument>
    </div>
  )
}
