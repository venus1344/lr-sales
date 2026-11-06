'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { saveReceipt, validateReceipt } from '@/lib/uploads'
import { expenseSchema } from '@/lib/validation/expense'

export type ExpenseFormState = { error?: string }

function readInput(formData: FormData) {
  return {
    requested_by: formData.get('requested_by'),
    income_account_id: formData.get('income_account_id'),
    expense_account_id: formData.get('expense_account_id'),
    project_id: formData.get('project_id'),
    receipt_number: formData.get('receipt_number'),
    amount: formData.get('amount'),
    narration: formData.get('narration'),
  }
}

function readReceipt(formData: FormData): File | null {
  const entry = formData.get('receipt')
  return entry instanceof File && entry.size > 0 ? entry : null
}

export async function createExpense(
  _prev: ExpenseFormState,
  formData: FormData,
): Promise<ExpenseFormState> {
  const session = await requireAbility('expense_store')

  const result = expenseSchema.safeParse(readInput(formData))
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid input' }
  }

  const file = readReceipt(formData)
  let receipt: string | null = null
  if (file) {
    const problem = validateReceipt(file)
    if (problem) {
      return { error: problem }
    }
    receipt = await saveReceipt(file)
  }

  const input = result.data
  await prisma.expenses.create({
    data: {
      created_by: BigInt(session.user.id),
      requested_by: BigInt(input.requested_by),
      income_account_id: BigInt(input.income_account_id),
      expense_account_id: BigInt(input.expense_account_id),
      project_id: input.project_id ? BigInt(input.project_id) : null,
      receipt_number: input.receipt_number,
      amount: String(input.amount),
      narration: input.narration,
      receipt,
    },
  })

  revalidatePath('/expenses')
  redirect('/expenses')
}

export async function updateExpense(
  id: string,
  _prev: ExpenseFormState,
  formData: FormData,
): Promise<ExpenseFormState> {
  const session = await requireAbility('expense_update')

  const result = expenseSchema.safeParse(readInput(formData))
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid input' }
  }

  const expenseId = BigInt(id)
  const existing = await prisma.expenses.findUnique({ where: { id: expenseId } })
  if (!existing) {
    return { error: 'Expense not found' }
  }

  const file = readReceipt(formData)
  let receipt = existing.receipt
  if (file) {
    const problem = validateReceipt(file)
    if (problem) {
      return { error: problem }
    }
    receipt = await saveReceipt(file)
  }

  const input = result.data
  await prisma.expenses.update({
    where: { id: expenseId },
    data: {
      updated_by: BigInt(session.user.id),
      requested_by: BigInt(input.requested_by),
      income_account_id: BigInt(input.income_account_id),
      expense_account_id: BigInt(input.expense_account_id),
      project_id: input.project_id ? BigInt(input.project_id) : null,
      receipt_number: input.receipt_number,
      amount: String(input.amount),
      narration: input.narration,
      receipt,
    },
  })

  revalidatePath('/expenses')
  redirect('/expenses')
}

export async function deleteExpense(id: string): Promise<void> {
  await requireAbility('expense_remove')

  await prisma.expenses.delete({ where: { id: BigInt(id) } })

  revalidatePath('/expenses')
}
