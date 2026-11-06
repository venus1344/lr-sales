import { describe, expect, it } from 'vitest'

import { deliveryNoteSchema } from '../lib/validation/delivery-note'

const valid = {
  date: '2026-11-06',
  name: 'WeLink Contracting',
  postal: '907',
  location: 'Arusha',
  contact: 'info@welink.co.tz',
  tin: '100167727',
  vrn: '11006745W',
  lines: [
    { item_id: '5', description: 'Wi-Fi 6 router', unit_measure: 'pcs', quantity: '2', serial_no: 'SN001' },
  ],
}

describe('deliveryNoteSchema', () => {
  it('accepts a valid delivery note', () => {
    const result = deliveryNoteSchema.safeParse(valid)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.lines[0].serial_no).toBe('SN001')
    }
  })

  it('accepts a null serial number', () => {
    const result = deliveryNoteSchema.safeParse({
      ...valid,
      lines: [{ ...valid.lines[0], serial_no: null }],
    })

    expect(result.success).toBe(true)
  })

  it('rejects a missing customer name', () => {
    const result = deliveryNoteSchema.safeParse({ ...valid, name: '' })

    expect(result.success).toBe(false)
  })

  it('rejects an empty line-items array', () => {
    const result = deliveryNoteSchema.safeParse({ ...valid, lines: [] })

    expect(result.success).toBe(false)
  })
})
