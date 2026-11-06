import { notFound } from 'next/navigation'

import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { CurrencyForm } from '../../form'

export const instant = false

export default async function EditCurrencyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await requireAbility('currency_update')

  const currency = await prisma.currencies.findUnique({ where: { id: BigInt(id) } })
  if (!currency) {
    notFound()
  }

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Edit currency</h1>
      <CurrencyForm
        currency={{
          id: String(currency.id),
          code: currency.code,
          name: currency.name,
          rate: currency.rate,
          active: currency.active,
        }}
      />
    </main>
  )
}
