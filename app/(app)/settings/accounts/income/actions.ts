'use server'

import { revalidatePath } from 'next/cache'

import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { accountSchema } from '@/lib/validation/account'
import { redirectWithToast } from '@/lib/toast'

export type AccountFormState = { error?: string }

function readInput(formData: FormData) {
  return {
    name: formData.get('name'),
    description: formData.get('description'),
    active: formData.get('active') === 'on',
  }
}

export async function createIncomeAccount(
  _prev: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const session = await requireAbility('income_account_store')

  const result = accountSchema.safeParse(readInput(formData))
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid input' }
  }

  await prisma.income_accounts.create({
    data: { ...result.data, created_by: BigInt(session.user.id) },
  })

  revalidatePath('/settings/accounts')
  revalidatePath('/settings/accounts/income')
  return redirectWithToast('/settings/accounts/income', 'Income account created')
}

export async function updateIncomeAccount(
  id: string,
  _prev: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const session = await requireAbility('income_account_update')

  const result = accountSchema.safeParse(readInput(formData))
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid input' }
  }

  await prisma.income_accounts.update({
    where: { id: BigInt(id) },
    data: { ...result.data, updated_by: BigInt(session.user.id) },
  })

  revalidatePath('/settings/accounts')
  revalidatePath('/settings/accounts/income')
  return redirectWithToast('/settings/accounts/income', 'Income account updated')
}

export async function deleteIncomeAccount(id: string): Promise<void> {
  await requireAbility('income_account_remove')

  const accountId = BigInt(id)
  try {
    await prisma.income_accounts.delete({ where: { id: accountId } })
  } catch {
    // In use by expenses: deactivate instead of failing.
    await prisma.income_accounts.update({ where: { id: accountId }, data: { active: false } })
  }

  revalidatePath('/settings/accounts')
  revalidatePath('/settings/accounts/income')
}
