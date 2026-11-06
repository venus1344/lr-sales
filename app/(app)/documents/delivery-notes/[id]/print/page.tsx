import { notFound } from 'next/navigation'

import { PrintButton } from '@/components/print-button'
import { requireAbility } from '@/lib/auth/guard'
import { company } from '@/lib/company'
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
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-4 flex justify-end">
        <PrintButton />
      </div>

      <div className="print-document sk-card p-8 text-sm">
        <div className="flex justify-between border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-lg font-bold">{company.name}</h1>
            <p className="text-gray-500">{company.address}</p>
            <p className="text-gray-500">{company.contact}</p>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-bold">DELIVERY NOTE</h2>
            <p className="text-gray-500">{note.date.toISOString().slice(0, 10)}</p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs uppercase text-gray-400">Deliver to</p>
          <p className="font-medium">{note.name}</p>
          {note.location ? <p>{note.location}</p> : null}
          {note.contact ? <p>{note.contact}</p> : null}
          {note.tin ? <p>TIN: {note.tin}</p> : null}
          {note.vrn ? <p>VRN: {note.vrn}</p> : null}
        </div>

        <table className="mt-6 w-full">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="py-2">Item</th>
              <th className="py-2">Description</th>
              <th className="py-2 text-center">Qty</th>
              <th className="py-2">Serial no</th>
            </tr>
          </thead>
          <tbody>
            {note.delivery_note_items.map((line) => (
              <tr key={String(line.id)} className="border-b border-gray-100">
                <td className="py-2">{line.items?.name}</td>
                <td className="py-2">{line.description}</td>
                <td className="py-2 text-center">{line.quantity}</td>
                <td className="py-2">{line.serial_no}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-10 grid grid-cols-2 gap-8 text-xs text-gray-500">
          <div>
            <p className="mb-6">Received by (name &amp; signature):</p>
            <div className="border-t border-gray-300 pt-1">Signature</div>
          </div>
          <div>
            <p className="mb-6">Delivered by:</p>
            <div className="border-t border-gray-300 pt-1">Signature</div>
          </div>
        </div>

        <p className="mt-8 border-t border-gray-200 pt-4 text-xs text-gray-500">
          {company.name} · {company.address} · {company.contact}
        </p>
      </div>
    </div>
  )
}
