export type PricingLine = {
  price: number
  quantity: number
}

export type PricingOptions = {
  /** VAT rate as a fraction (e.g. 0.18 for 18%). */
  vatRate: number
  /** Withholding-tax rate as a fraction (e.g. 0.02 for 2%). */
  withholdingRate: number
  /** Flat labour charge added to the invoice. */
  laborCharge: number
  /** Flat discount subtracted from the invoice. */
  discount: number
  /** Advance already paid, subtracted from the invoice (default 0). */
  advance?: number
}

export type PricingResult = {
  subtotal: number
  vat: number
  withholding: number
  laborCharge: number
  discount: number
  advance: number
  total: number
}

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

/**
 * Calculate invoice/proforma totals.
 *
 * total = subtotal + vat + labourCharge − discount − withholding − advance
 */
export function calculateTotals(lines: PricingLine[], options: PricingOptions): PricingResult {
  const subtotal = round2(lines.reduce((sum, line) => sum + line.price * line.quantity, 0))
  const vat = round2(subtotal * options.vatRate)
  const withholding = round2(subtotal * options.withholdingRate)
  const laborCharge = round2(options.laborCharge)
  const discount = round2(options.discount)
  const advance = round2(options.advance ?? 0)
  const total = round2(subtotal + vat + laborCharge - discount - withholding - advance)

  return { subtotal, vat, withholding, laborCharge, discount, advance, total }
}
