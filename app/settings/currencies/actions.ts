'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { currencySchema } from '@/lib/validation/currency'

export type CurrencyFormState = { error?: string }

function readInput(formData: FormData) {
  return {
    code: formData.get('code'),
    name: formData.get('name'),
    rate: formData.get('rate'),
    active: formData.get('active') === 'on',
  }
}

export async function createCurrency(
  _prev: CurrencyFormState,
  formData: FormData,
): Promise<CurrencyFormState> {
  const session = await requireAbility('currency_store')

  const result = currencySchema.safeParse(readInput(formData))
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid input' }
  }

  await prisma.currencies.create({
    data: { ...result.data, created_by: BigInt(session.user.id) },
  })

  revalidatePath('/settings/currencies')
  redirect('/settings/currencies')
}

export async function updateCurrency(
  id: string,
  _prev: CurrencyFormState,
  formData: FormData,
): Promise<CurrencyFormState> {
  const session = await requireAbility('currency_update')

  const result = currencySchema.safeParse(readInput(formData))
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid input' }
  }

  await prisma.currencies.update({
    where: { id: BigInt(id) },
    data: { ...result.data, updated_by: BigInt(session.user.id) },
  })

  revalidatePath('/settings/currencies')
  redirect('/settings/currencies')
}

export async function deleteCurrency(id: string): Promise<void> {
  await requireAbility('currency_remove')

  await prisma.currencies.delete({ where: { id: BigInt(id) } })

  revalidatePath('/settings/currencies')
}
