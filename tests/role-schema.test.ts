import { describe, expect, it } from 'vitest'

import { roleSchema } from '../lib/validation/role'

describe('roleSchema', () => {
  it('accepts a name and description', () => {
    const result = roleSchema.safeParse({ name: 'Cashier', description: 'Handles sales' })
    expect(result.success).toBe(true)
  })

  it('rejects a missing name', () => {
    const result = roleSchema.safeParse({ name: '', description: 'x' })
    expect(result.success).toBe(false)
  })

  it('rejects a description longer than 500 characters', () => {
    const result = roleSchema.safeParse({ name: 'Cashier', description: 'x'.repeat(501) })
    expect(result.success).toBe(false)
  })
})
