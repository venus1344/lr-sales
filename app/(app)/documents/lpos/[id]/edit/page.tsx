import { notFound } from 'next/navigation'

import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { LpoForm } from '../../form'

export const instant = false

export default async function EditLpoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await requireAbility('lpo_update')

  const lpo = await prisma.local_purchase_orders.findUnique({
    where: { id: BigInt(id) },
    include: { local_purchase_order_items: true },
  })

  if (!lpo) {
    notFound()
  }

  const [suppliers, items] = await Promise.all([
    prisma.suppliers.findMany({ orderBy: { name: 'asc' } }),
    prisma.items.findMany({ where: { active: true }, orderBy: { name: 'asc' } }),
  ])

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Edit LPO</h1>
      <LpoForm
        lpo={{
          id: String(lpo.id),
          supplier_id: String(lpo.supplier_id),
          date: lpo.date.toISOString().slice(0, 10),
          currency: lpo.currency,
          for: lpo.for,
          proforma_referenced: lpo.proforma_referenced,
          extra_notes: lpo.extra_notes,
          vat: Number(lpo.vat),
          withholding_tax: Number(lpo.withholding_tax),
          lines: lpo.local_purchase_order_items.map((line) => ({
            item_id: String(line.item_id),
            specification: line.specification,
            quantity: String(line.quantity),
            price: String(line.price),
          })),
        }}
        suppliers={suppliers.map((s) => ({ id: String(s.id), name: s.name }))}
        items={items.map((item) => ({
          id: String(item.id),
          name: item.name,
          specification: item.specification,
          price: Number(item.price),
        }))}
      />
    </main>
  )
}
