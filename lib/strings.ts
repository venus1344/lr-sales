/**
 * Convert a human label into a snake_case settings key, e.g.
 * "Tax Rate" → "tax_rate", "VAT Rate" → "vat_rate".
 */
export function toSnakeCase(value: string): string {
  return value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase()
}
