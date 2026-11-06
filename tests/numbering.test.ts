import { describe, expect, it } from 'vitest'

import { DocumentPrefix, documentNumber, nextSequence, parseSequence } from '../lib/numbering'

describe('documentNumber', () => {
  it('formats a document number', () => {
    expect(documentNumber(DocumentPrefix.invoice, 5)).toBe('WE/INV/No:5')
    expect(documentNumber(DocumentPrefix.proforma, 12)).toBe('WE/PF/No:12')
  })

  it('parses the sequence from a document number', () => {
    expect(parseSequence('WE/INV/No:5')).toBe(5)
    expect(parseSequence('WE/PF/No:12')).toBe(12)
  })

  it('returns 0 for unparseable values', () => {
    expect(parseSequence('not a number')).toBe(0)
    expect(parseSequence('')).toBe(0)
  })

  it('computes the next sequence', () => {
    expect(nextSequence([])).toBe(1)
    expect(nextSequence(['WE/INV/No:3', 'WE/INV/No:7', 'WE/INV/No:1'])).toBe(8)
  })
})
