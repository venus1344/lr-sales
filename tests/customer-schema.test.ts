import { describe, expect, it } from 'vitest'

import { customerSchema } from '../lib/validation/customer'

describe('customerSchema', () => {
  it('accepts a customer with only a name', () => {
    const result = customerSchema.safeParse({
      name: 'WeLink Contracting',
      postal_code: null,
      postal_address: null,
      location: null,
      contact: null,
      tin: null,
      vrn: null,
      status: true,
    })

    expect(result.success).toBe(true)
  })

  it('accepts a fully-populated customer', () => {
    const result = customerSchema.safeParse({
      name: 'WeLink Contracting',
      postal_code: '907',
      postal_address: 'Arusha',
      location: 'Arusha',
      contact: 'info@welink.co.tz',
      tin: '100167727',
      vrn: '11006745W',
      status: true,
    })

    expect(result.success).toBe(true)
  })

  it('rejects a missing name', () => {
    const result = customerSchema.safeParse({
      name: '',
      postal_code: null,
      postal_address: null,
      location: null,
      contact: null,
      tin: null,
      vrn: null,
      status: true,
    })

    expect(result.success).toBe(false)
  })
})
