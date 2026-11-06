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

export async function createExpenseAccount(
  _prev: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const session = await requireAbility('expense_account_store')

  const result = accountSchema.safeParse(readInput(formData))
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid input' }
  }

  await prisma.expense_accounts.create({
    data: { ...result.data, created_by: BigInt(session.user.id) },
  })

  revalidatePath('/settings/accounts')
  revalidatePath('/settings/accounts/expense')
  return redirectWithToast('/settings/accounts/expense', 'Expense account created')
}

export async function updateExpenseAccount(
  id: string,
  _prev: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const session = await requireAbility('expense_account_update')

  const result = accountSchema.safeParse(readInput(formData))
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid input' }
  }

  await prisma.expense_accounts.update({
    where: { id: BigInt(id) },
    data: { ...result.data, updated_by: BigInt(session.user.id) },
  })

  revalidatePath('/settings/accounts')
  revalidatePath('/settings/accounts/expense')
  return redirectWithToast('/settings/accounts/expense', 'Expense account updated')
}

export async function deleteExpenseAccount(id: string): Promise<void> {
  await requireAbility('expense_account_remove')

  const accountId = BigInt(id)
  try {
    await prisma.expense_accounts.delete({ where: { id: accountId } })
  } catch {
    // In use by expenses: deactivate instead of failing.
    await prisma.expense_accounts.update({ where: { id: accountId }, data: { active: false } })
  }

  revalidatePath('/settings/accounts')
  revalidatePath('/settings/accounts/expense')
}
