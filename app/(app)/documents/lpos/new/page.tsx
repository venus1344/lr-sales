import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { LpoForm } from '../form'

export const instant = false

export default async function NewLpoPage() {
  await requireAbility('lpo_store')

  const [suppliers, items] = await Promise.all([
    prisma.suppliers.findMany({ orderBy: { name: 'asc' } }),
    prisma.items.findMany({ where: { active: true }, orderBy: { name: 'asc' } }),
  ])

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">New LPO</h1>
      <LpoForm
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
