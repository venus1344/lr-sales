import { z } from 'zod'

export const supplierSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(191),
  location: z.string().trim().min(1, 'Location is required').max(191),
  contacts: z.string().trim().min(1, 'Contacts are required').max(191),
  postal_code: z.string().trim().max(191).nullable(),
  postal_address: z.string().trim().max(191).nullable(),
  tin: z.string().trim().max(20).nullable(),
  vrn: z.string().trim().max(20).nullable(),
  status: z.boolean(),
})

export type SupplierInput = z.infer<typeof supplierSchema>
