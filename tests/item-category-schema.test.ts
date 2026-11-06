import { describe, expect, it } from 'vitest'

import { itemCategorySchema } from '../lib/validation/item-category'

describe('itemCategorySchema', () => {
  it('accepts a valid category', () => {
    const result = itemCategorySchema.safeParse({
      name: 'Networking',
      description: 'Network hardware',
      active: true,
    })

    expect(result.success).toBe(true)
  })

  it('accepts a null description', () => {
    const result = itemCategorySchema.safeParse({
      name: 'Networking',
      description: null,
      active: true,
    })

    expect(result.success).toBe(true)
  })

  it('rejects a missing name', () => {
    const result = itemCategorySchema.safeParse({
      name: '',
      description: null,
      active: true,
    })

    expect(result.success).toBe(false)
  })
})
