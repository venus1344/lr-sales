import { describe, expect, it } from 'vitest'

import { accountSchema } from '../lib/validation/account'

describe('accountSchema', () => {
  it('accepts a valid account', () => {
    const result = accountSchema.safeParse({
      name: 'NBC LPO Facility',
      description: 'Bank facility',
      active: true,
    })
    expect(result.success).toBe(true)
  })

  it('rejects a missing name', () => {
    const result = accountSchema.safeParse({ name: '', description: 'x', active: true })
    expect(result.success).toBe(false)
  })

  it('rejects a missing description', () => {
    const result = accountSchema.safeParse({ name: 'Income', description: '', active: true })
    expect(result.success).toBe(false)
  })
})
