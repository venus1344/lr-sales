import { describe, expect, it } from 'vitest'

import { RECEIPT_MAX_BYTES, validateReceipt } from '../lib/uploads'

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
