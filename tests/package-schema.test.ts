import { describe, expect, it } from 'vitest'

import { packageSchema } from '../lib/validation/package'

describe('packageSchema', () => {
  it('accepts a valid package and coerces the price', () => {
    const result = packageSchema.safeParse({
      name: 'Home 10Mbps',
      description: 'Residential 10 Mbps package',
      price: '60000',
      status: true,
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.price).toBe(60000)
    }
  })

  it('rejects a missing description', () => {
    const result = packageSchema.safeParse({
      name: 'Home 10Mbps',
      description: '',
      price: '60000',
      status: true,
    })

    expect(result.success).toBe(false)
  })

  it('rejects a negative price', () => {
    const result = packageSchema.safeParse({
      name: 'Home 10Mbps',
      description: 'Residential package',
      price: '-1',
      status: true,
    })

    expect(result.success).toBe(false)
  })
})
