import { z } from 'zod'

export const lpoLineSchema = z.object({
  item_id: z.coerce.number().int().positive('Select an item'),
  specification: z.string().trim().min(1, 'Specification is required'),
  quantity: z.coerce.number().int().positive('Quantity must be at least 1'),
  price: z.coerce.number().min(0, 'Price must be zero or more'),
})

export const lpoSchema = z.object({
  supplier_id: z.coerce.number().int().positive('Select a supplier'),
  date: z.coerce.date(),
  currency: z.string().trim().min(1).max(100),
  for: z.string().trim().max(191).nullable(),
  proforma_referenced: z.string().trim().max(191).nullable(),
  extra_notes: z.string().trim().max(300).nullable(),
  vat: z.coerce.number().min(0).max(100),
  withholding_tax: z.coerce.number().min(0).max(100),
  lines: z.array(lpoLineSchema).min(1, 'Add at least one line item'),
})

export type LpoInput = z.infer<typeof lpoSchema>
