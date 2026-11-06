import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { DeliveryNoteForm } from '../form'

export const instant = false

export default async function NewDeliveryNotePage() {
  await requireAbility('dnote_store')

  const items = await prisma.items.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
  })

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">New delivery note</h1>
      <DeliveryNoteForm
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
