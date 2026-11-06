export const DocumentPrefix = {
  invoice: 'WE/INV/',
  proforma: 'WE/PF/',
  lpo: 'WE/LPO/',
  internetInvoice: 'WE/INTERNET/INV/',
} as const

export function documentNumber(prefix: string, sequence: number): string {
  return `${prefix}No:${sequence}`
}

export function parseSequence(value: string): number {
  const match = value.match(/No:(\d+)$/)
  return match ? Number(match[1]) : 0
}

export function nextSequence(existing: string[]): number {
  return existing.reduce((max, value) => Math.max(max, parseSequence(value)), 0) + 1
}
