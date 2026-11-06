import { z } from 'zod'

export const dnoteLineSchema = z.object({
  item_id: z.coerce.number().int().positive('Select an item'),
  description: z.string().trim().min(1, 'Description is required'),
  unit_measure: z.string().trim().nullable(),
  quantity: z.coerce.number().int().positive('Quantity must be at least 1'),
  serial_no: z.string().trim().nullable(),
})

export const deliveryNoteSchema = z.object({
  date: z.coerce.date(),
  name: z.string().trim().min(1, 'Customer name is required').max(191),
  postal: z.string().trim().max(191).nullable(),
  location: z.string().trim().max(191).nullable(),
  contact: z.string().trim().max(191).nullable(),
  tin: z.string().trim().max(20).nullable(),
  vrn: z.string().trim().max(20).nullable(),
  lines: z.array(dnoteLineSchema).min(1, 'Add at least one line item'),
})

export type DeliveryNoteInput = z.infer<typeof deliveryNoteSchema>
