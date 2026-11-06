import { describe, expect, it } from 'vitest'

import { calculateTotals, round2 } from '../lib/pricing'

describe('calculateTotals', () => {
  it('calculates subtotal, VAT, withholding, and total', () => {
    const result = calculateTotals(
      [
        { price: 100, quantity: 2 },
        { price: 50, quantity: 1 },
      ],
      { vatRate: 0.18, withholdingRate: 0.02, laborCharge: 10, discount: 5 },
    )

    expect(result.subtotal).toBe(250)
    expect(result.vat).toBe(45) // 250 × 0.18
    expect(result.withholding).toBe(5) // 250 × 0.02
    expect(result.laborCharge).toBe(10)
    expect(result.discount).toBe(5)
    expect(result.total).toBe(295) // 250 + 45 + 10 − 5 − 5
  })

  it('returns zero totals for no lines', () => {
    const result = calculateTotals([], {
      vatRate: 0.18,
      withholdingRate: 0.02,
      laborCharge: 0,
      discount: 0,
    })

    expect(result).toEqual({
      subtotal: 0,
      vat: 0,
      withholding: 0,
      laborCharge: 0,
      discount: 0,
      total: 0,
    })
  })

  it('rounds money to 2 decimal places', () => {
    expect(round2(1.005)).toBe(1.01)
    expect(round2(1.004)).toBe(1)
    expect(round2(2.675)).toBe(2.68)
  })
})
