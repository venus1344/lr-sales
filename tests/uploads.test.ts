import { describe, expect, it } from 'vitest'

import {
  RECEIPT_MAX_BYTES,
  isSafeReceiptName,
  receiptContentType,
  receiptUrl,
  validateReceipt,
} from '../lib/uploads'

const UUID = '11111111-2222-3333-4444-555555555555'

describe('validateReceipt', () => {
  it('accepts an allowed image and a PDF', () => {
    expect(validateReceipt({ type: 'image/png', size: 1024 })).toBeNull()
    expect(validateReceipt({ type: 'application/pdf', size: 1024 })).toBeNull()
  })

  it('rejects an unsupported MIME type', () => {
    expect(validateReceipt({ type: 'application/x-php', size: 1024 })).toMatch(/Unsupported/)
  })

  it('rejects an empty file', () => {
    expect(validateReceipt({ type: 'image/png', size: 0 })).toMatch(/empty/)
  })

  it('rejects a file above the size cap', () => {
    expect(validateReceipt({ type: 'image/png', size: RECEIPT_MAX_BYTES + 1 })).toMatch(/too large/)
  })
})

describe('receipt serving', () => {
  it('links to the authenticated route rather than the public folder', () => {
    expect(receiptUrl(`${UUID}.pdf`)).toBe(`/api/receipts/${UUID}.pdf`)
  })

  it('accepts a UUID plus an allowed extension', () => {
    expect(isSafeReceiptName(`${UUID}.pdf`)).toBe(true)
    expect(isSafeReceiptName(`${UUID}.png`)).toBe(true)
  })

  it('rejects traversal, unknown extensions, and non-UUID names', () => {
    expect(isSafeReceiptName('../../etc/passwd')).toBe(false)
    expect(isSafeReceiptName(`${UUID}.php`)).toBe(false)
    expect(isSafeReceiptName('receipt.pdf')).toBe(false)
  })

  it('maps stored extensions to their content type', () => {
    expect(receiptContentType(`${UUID}.pdf`)).toBe('application/pdf')
    expect(receiptContentType(`${UUID}.jpg`)).toBe('image/jpeg')
    expect(receiptContentType(`${UUID}.exe`)).toBeNull()
  })
})
