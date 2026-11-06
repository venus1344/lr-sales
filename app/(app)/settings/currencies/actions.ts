'use server'

import { revalidatePath } from 'next/cache'

import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { currencySchema } from '@/lib/validation/currency'
import { redirectWithToast } from '@/lib/toast'

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
  return redirectWithToast('/settings/currencies', 'Currency created')
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
  return redirectWithToast(`/settings/currencies/${id}`, 'Currency updated')
}

export async function deleteCurrency(id: string): Promise<void> {
  await requireAbility('currency_remove')

  await prisma.currencies.delete({ where: { id: BigInt(id) } })

  revalidatePath('/settings/currencies')
}

export async function deleteCurrencyFromView(id: string): Promise<void> {
  try {
    await deleteCurrency(id)
  } catch {
    return redirectWithToast('/settings/currencies', 'Could not delete the currency', 'error')
  }
  return redirectWithToast('/settings/currencies', 'Currency deleted')
}
