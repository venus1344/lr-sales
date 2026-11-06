import { describe, expect, it } from 'vitest'

import { toCustomerOption, toItemOption, toSupplierOption } from '../lib/search-options'

describe('toItemOption', () => {
  it('maps an item to a search option with payload data', () => {
    const option = toItemOption({
      id: BigInt(42),
      name: 'Router',
      specification: 'Dual-band',
      unit_measure: 'pcs',
      price: '150000.00',
    })

    expect(option).toEqual({
      value: '42',
      label: 'Router',
      hint: 'Dual-band · pcs',
      data: { specification: 'Dual-band', unit_measure: 'pcs', price: 150000 },
    })
  })

  it('treats missing price as zero and omits empty hints', () => {
    const option = toItemOption({ id: '7', name: 'Cable' })

    expect(option.value).toBe('7')
    expect(option.hint).toBeUndefined()
    expect(option.data).toEqual({
      specification: null,
      unit_measure: null,
      price: 0,
    })
  })
})

describe('toCustomerOption', () => {
  it('carries address fields for autofill', () => {
    const option = toCustomerOption({
      id: 3,
      name: 'Acme Ltd',
      location: 'Dar es Salaam',
      contact: 'Jane',
      postal: '1234',
      tin: '123-456-789',
      vrn: '456-789',
    })

    expect(option.value).toBe('3')
    expect(option.hint).toBe('Dar es Salaam')
    expect(option.data).toEqual({
      location: 'Dar es Salaam',
      contact: 'Jane',
      postal: '1234',
      tin: '123-456-789',
      vrn: '456-789',
    })
  })
})

describe('toSupplierOption', () => {
  it('carries supplier details for autofill', () => {
    const option = toSupplierOption({
      id: BigInt(9),
      name: 'Global Supplies',
      location: 'Mwanza',
      contacts: 'John',
      tin: '987-654-321',
    })

    expect(option.value).toBe('9')
    expect(option.hint).toBe('Mwanza')
    expect(option.data).toEqual({
      location: 'Mwanza',
      contacts: 'John',
      tin: '987-654-321',
    })
  })
})
