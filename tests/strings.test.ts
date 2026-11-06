import { describe, expect, it } from 'vitest'

import { toSnakeCase } from '../lib/strings'

describe('toSnakeCase', () => {
  it('lowercases and joins with underscores', () => {
    expect(toSnakeCase('Tax Rate')).toBe('tax_rate')
    expect(toSnakeCase('VAT Rate')).toBe('vat_rate')
  })

  it('converts camelCase to snake_case', () => {
    expect(toSnakeCase('dueInvoiceDays')).toBe('due_invoice_days')
  })

  it('handles hyphens and surrounding spaces', () => {
    expect(toSnakeCase('  late-fee  ')).toBe('late_fee')
  })
})
