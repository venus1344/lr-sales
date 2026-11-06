import { z } from 'zod'

export const expenseSchema = z.object({
  requested_by: z.coerce.number().int().min(1, 'Select who requested it'),
  income_account_id: z.coerce.number().int().min(1, 'Select an income account'),
  expense_account_id: z.coerce.number().int().min(1, 'Select an expense account'),
  project_id: z.preprocess(
    (value) => (value === '' || value === undefined ? null : value),
    z.coerce.number().int().positive().nullable(),
  ),
  receipt_number: z.string().trim().min(1, 'Receipt number is required').max(50),
  amount: z.coerce.number().min(0, 'Amount must be zero or greater'),
  narration: z.string().trim().min(1, 'Narration is required').max(800),
})

export type ExpenseInput = z.infer<typeof expenseSchema>
