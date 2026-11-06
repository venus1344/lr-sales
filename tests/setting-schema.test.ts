import { describe, expect, it } from 'vitest'

import { settingSchema } from '../lib/validation/setting'

describe('settingSchema', () => {
  it('accepts a name and coerces a numeric value', () => {
    const result = settingSchema.safeParse({ name: 'tax_rate', value: '18' })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.value).toBe(18)
    }
  })

  it('rejects a non-numeric value', () => {
    const result = settingSchema.safeParse({ name: 'tax_rate', value: 'abc' })
    expect(result.success).toBe(false)
  })

  it('rejects an empty value', () => {
    const result = settingSchema.safeParse({ name: 'tax_rate', value: '' })
    expect(result.success).toBe(false)
  })

  it('rejects a negative value', () => {
    const result = settingSchema.safeParse({ name: 'tax_rate', value: '-1' })
    expect(result.success).toBe(false)
  })
})
