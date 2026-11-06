import { describe, expect, it } from 'vitest'

import { formatTin, formatVrn } from '../lib/format'

describe('formatTin', () => {
  it('formats a 9-digit TIN as XXX-XXX-XXX', () => {
    expect(formatTin('100167727')).toBe('100-167-727')
  })

  it('returns non-9-digit input unchanged', () => {
    expect(formatTin('12345')).toBe('12345')
  })

  it('returns null for blank input', () => {
    expect(formatTin(null)).toBeNull()
    expect(formatTin('')).toBeNull()
    expect(formatTin('   ')).toBeNull()
  })
})

describe('formatVrn', () => {
  it('formats a 9-char VRN as XX-XXXXXX-X and uppercases the last char', () => {
    expect(formatVrn('11006745w')).toBe('11-006745-W')
  })

  it('returns non-9-char input unchanged', () => {
    expect(formatVrn('1234')).toBe('1234')
  })

  it('returns null for blank input', () => {
    expect(formatVrn(undefined)).toBeNull()
    expect(formatVrn('  ')).toBeNull()
  })
})
