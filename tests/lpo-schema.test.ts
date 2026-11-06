import { describe, expect, it } from 'vitest'

import { lpoSchema } from '../lib/validation/lpo'

const valid = {
  supplier_id: '3',
  date: '2026-11-06',
  currency: 'TZS',
  for: 'Network equipment',
  proforma_referenced: 'WE/PF/No:12',
  extra_notes: 'Urgent',
  vat: '18',
  withholding_tax: '2',
  lines: [
    { item_id: '5', specification: 'Wi-Fi 6 router', quantity: '2', price: '150000' },
  ],
}

describe('lpoSchema', () => {
  it('accepts a valid LPO and coerces numeric fields', () => {
    const result = lpoSchema.safeParse(valid)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.supplier_id).toBe(3)
      expect(result.data.vat).toBe(18)
    }
  })

  it('rejects a missing supplier', () => {
    const result = lpoSchema.safeParse({ ...valid, supplier_id: '' })

    expect(result.success).toBe(false)
  })

  it('rejects an empty line-items array', () => {
    const result = lpoSchema.safeParse({ ...valid, lines: [] })

    expect(result.success).toBe(false)
  })
})
