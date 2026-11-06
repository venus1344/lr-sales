import { describe, expect, it } from 'vitest'

import { supplierSchema } from '../lib/validation/supplier'

describe('supplierSchema', () => {
  it('accepts a valid supplier', () => {
    const result = supplierSchema.safeParse({
      name: 'Acme Supplies',
      location: 'Arusha',
      contacts: 'info@acme.co.tz',
      postal_code: null,
      postal_address: null,
      tin: '100167727',
      vrn: null,
      status: true,
    })

    expect(result.success).toBe(true)
  })

  it('rejects missing required fields', () => {
    const result = supplierSchema.safeParse({
      name: '',
      location: '',
      contacts: '',
      postal_code: null,
      postal_address: null,
      tin: null,
      vrn: null,
      status: true,
    })

    expect(result.success).toBe(false)
  })
})
