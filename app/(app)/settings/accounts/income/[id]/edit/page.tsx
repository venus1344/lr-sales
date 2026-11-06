import { notFound } from 'next/navigation'

import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { IncomeAccountForm } from '../../form'

export const instant = false

export default async function EditIncomeAccountPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await requireAbility('income_account_update')

  const account = await prisma.income_accounts.findUnique({ where: { id: BigInt(id) } })
  if (!account) {
    notFound()
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Edit income account</h1>
      <IncomeAccountForm
        account={{
          id: String(account.id),
          name: account.name,
          description: account.description,
          active: account.active,
        }}
      />
    </main>
  )
}
