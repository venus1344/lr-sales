import { describe, expect, it } from 'vitest'

import { invoiceSchema } from '../lib/validation/invoice'

const valid = {
  proforma_id: null,
  name: 'WeLink Contracting',
  date: '2026-11-06',
  currency: 'TZS',
  exchange_rate: '1',
  labor_charge: '0',
  vat: '18',
  withholding_tax: '2',
  advance: '0',
  discount: '0',
  for: 'Supply of network equipment',
  contact: 'info@welink.co.tz',
  location: 'Arusha',
  postal: '907',
  tin: '100167727',
  vrn: '11006745W',
  lines: [
    { item_id: '5', specification: 'Wi-Fi 6 router', unit_measure: 'pcs', quantity: '2', price: '150000' },
  ],
}

describe('invoiceSchema', () => {
  it('accepts a valid invoice and coerces numeric fields', () => {
    const result = invoiceSchema.safeParse(valid)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.discount).toBe(0)
      expect(result.data.lines[0].item_id).toBe(5)
    }
  })

  it('accepts a nullable proforma_id', () => {
    const result = invoiceSchema.safeParse({ ...valid, proforma_id: 12 })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.proforma_id).toBe(12)
    }
  })

  it('rejects an empty line-items array', () => {
    const result = invoiceSchema.safeParse({ ...valid, lines: [] })

    expect(result.success).toBe(false)
  })

  it('rejects a negative discount', () => {
    const result = invoiceSchema.safeParse({ ...valid, discount: '-1' })

    expect(result.success).toBe(false)
  })
})
