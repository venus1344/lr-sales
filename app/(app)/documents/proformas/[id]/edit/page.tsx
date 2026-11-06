import { notFound } from 'next/navigation'

import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { ProformaForm } from '../../form'

export const instant = false

export default async function EditProformaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await requireAbility('proforma_update')

  const proforma = await prisma.proformas.findUnique({
    where: { id: BigInt(id) },
    include: { proforma_items: true },
  })

  if (!proforma) {
    notFound()
  }

  const items = await prisma.items.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
  })

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Edit proforma</h1>
      <ProformaForm
        proforma={{
          id: String(proforma.id),
          name: proforma.name,
          date: proforma.date.toISOString().slice(0, 10),
          currency: proforma.currency,
          exchange_rate: Number(proforma.exchange_rate),
          labor_charge: Number(proforma.labor_charge),
          vat: Number(proforma.vat),
          withholding_tax: Number(proforma.withholding_tax ?? 0),
          advance: Number(proforma.advance),
          for: proforma.for,
          contact: proforma.contact,
          location: proforma.location,
          postal: proforma.postal,
          tin: proforma.tin,
          vrn: proforma.vrn,
          lines: proforma.proforma_items.map((line) => ({
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
