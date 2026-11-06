import { describe, expect, it } from 'vitest'

import { currencySchema } from '../lib/validation/currency'

describe('currencySchema', () => {
  it('accepts valid input and coerces the rate to a number', () => {
    const result = currencySchema.safeParse({
      code: 'USD',
      name: 'US Dollar',
      rate: '2500.50',
      active: true,
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.code).toBe('USD')
      expect(result.data.rate).toBe(2500.5)
    }
  })

  it('rejects a code that is not exactly 3 letters', () => {
    const result = currencySchema.safeParse({
      code: 'US',
      name: 'Dollar',
      rate: '1',
      active: true,
    })

    expect(result.success).toBe(false)
  })

  it('rejects a missing name', () => {
    const result = currencySchema.safeParse({
      code: 'USD',
      name: '',
      rate: '1',
      active: true,
    })

    expect(result.success).toBe(false)
  })

  it('rejects a negative rate', () => {
    const result = currencySchema.safeParse({
      code: 'USD',
      name: 'Dollar',
      rate: '-5',
      active: true,
    })

    expect(result.success).toBe(false)
  })
})
