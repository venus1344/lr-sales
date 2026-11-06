import { describe, expect, it } from 'vitest'

import { expenseSchema } from '../lib/validation/expense'

describe('expenseSchema', () => {
  it('accepts a valid expense with a project', () => {
    const result = expenseSchema.safeParse({
      requested_by: '1',
      income_account_id: '2',
      expense_account_id: '3',
      project_id: '4',
      receipt_number: 'RCT-001',
      amount: '1500.50',
      narration: 'CCTV installation',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.amount).toBe(1500.5)
      expect(result.data.project_id).toBe(4)
    }
  })

  it('accepts an expense without a project', () => {
    const result = expenseSchema.safeParse({
      requested_by: '1',
      income_account_id: '2',
      expense_account_id: '3',
      project_id: '',
      receipt_number: 'RCT-002',
      amount: '10',
      narration: 'Misc',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.project_id).toBeNull()
    }
  })

  it('rejects a negative amount', () => {
    const result = expenseSchema.safeParse({
      requested_by: '1',
      income_account_id: '2',
      expense_account_id: '3',
      project_id: '',
      receipt_number: 'RCT-003',
      amount: '-5',
      narration: 'x',
    })
    expect(result.success).toBe(false)
  })

  it('rejects an empty narration', () => {
    const result = expenseSchema.safeParse({
      requested_by: '1',
      income_account_id: '2',
      expense_account_id: '3',
      project_id: '',
      receipt_number: 'RCT-003',
      amount: '5',
      narration: '',
    })
    expect(result.success).toBe(false)
  })
})
