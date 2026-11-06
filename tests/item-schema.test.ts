import { describe, expect, it } from 'vitest'

import { itemSchema } from '../lib/validation/item'

describe('itemSchema', () => {
  it('accepts a valid item and coerces category_id and price', () => {
    const result = itemSchema.safeParse({
      category_id: '5',
      name: 'Router',
      unit_measure: 'pcs',
      specification: 'Wi-Fi 6 router',
      price: '150000',
      active: true,
      vat: true,
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.category_id).toBe(5)
      expect(result.data.price).toBe(150000)
    }
  })

  it('rejects a missing category', () => {
    const result = itemSchema.safeParse({
      category_id: '',
      name: 'Router',
      unit_measure: null,
      specification: null,
      price: '150000',
      active: true,
      vat: true,
    })

    expect(result.success).toBe(false)
  })

  it('rejects a missing name', () => {
    const result = itemSchema.safeParse({
      category_id: '5',
      name: '',
      unit_measure: null,
      specification: null,
      price: '150000',
      active: true,
      vat: true,
    })

    expect(result.success).toBe(false)
  })

  it('rejects a negative price', () => {
    const result = itemSchema.safeParse({
      category_id: '5',
      name: 'Router',
      unit_measure: null,
      specification: null,
      price: '-1',
      active: true,
      vat: true,
    })

    expect(result.success).toBe(false)
  })
})
