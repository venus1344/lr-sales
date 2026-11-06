import { z } from 'zod'

export const invoiceLineSchema = z.object({
  item_id: z.coerce.number().int().positive('Select an item'),
  specification: z.string().trim().min(1, 'Specification is required'),
  unit_measure: z.string().trim().nullable(),
  quantity: z.coerce.number().int().positive('Quantity must be at least 1'),
  price: z.coerce.number().min(0, 'Price must be zero or more'),
})

export const invoiceSchema = z.object({
  proforma_id: z.number().int().positive().nullable(),
  name: z.string().trim().min(1, 'Customer name is required').max(191),
  date: z.coerce.date(),
  currency: z.string().trim().min(1).max(10),
  exchange_rate: z.coerce.number().min(0),
  labor_charge: z.coerce.number().min(0),
  vat: z.coerce.number().min(0).max(100),
  withholding_tax: z.coerce.number().min(0).max(100),
  advance: z.coerce.number().min(0),
  discount: z.coerce.number().min(0),
  for: z.string().trim().min(1, 'Purpose is required').max(191),
  contact: z.string().trim().max(191).nullable(),
  location: z.string().trim().max(191).nullable(),
  postal: z.string().trim().max(191).nullable(),
  tin: z.string().trim().max(20).nullable(),
  vrn: z.string().trim().max(20).nullable(),
  lines: z.array(invoiceLineSchema).min(1, 'Add at least one line item'),
})

export type InvoiceInput = z.infer<typeof invoiceSchema>
