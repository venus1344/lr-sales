import { describe, expect, it } from 'vitest'

import { proformaSchema } from '../lib/validation/proforma'

const valid = {
  name: 'WeLink Contracting',
  date: '2026-11-06',
  currency: 'TZS',
  exchange_rate: '1',
  labor_charge: '0',
  vat: '18',
  withholding_tax: '2',
  advance: '0',
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

describe('proformaSchema', () => {
  it('accepts a valid proforma and coerces numeric fields', () => {
    const result = proformaSchema.safeParse(valid)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.vat).toBe(18)
      expect(result.data.lines[0].item_id).toBe(5)
      expect(result.data.lines[0].quantity).toBe(2)
    }
  })

  it('rejects an empty line-items array', () => {
    const result = proformaSchema.safeParse({ ...valid, lines: [] })

    expect(result.success).toBe(false)
  })

  it('rejects a missing customer name', () => {
    const result = proformaSchema.safeParse({ ...valid, name: '' })

    expect(result.success).toBe(false)
  })

  it('rejects a negative line price', () => {
    const result = proformaSchema.safeParse({
      ...valid,
      lines: [{ ...valid.lines[0], price: '-1' }],
    })

    expect(result.success).toBe(false)
  })
})
