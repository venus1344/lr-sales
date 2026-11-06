import { z } from 'zod'

export const itemSchema = z.object({
  category_id: z.coerce.number().int().positive('Category is required'),
  name: z.string().trim().min(1, 'Name is required').max(100),
  unit_measure: z.string().trim().max(100).nullable(),
  specification: z.string().max(1000).nullable(),
  price: z.coerce.number().min(0, 'Price must be zero or more'),
  active: z.boolean(),
  vat: z.boolean(),
})

export type ItemInput = z.infer<typeof itemSchema>
