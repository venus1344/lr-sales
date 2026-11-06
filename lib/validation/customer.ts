import { z } from 'zod'

export const customerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(191),
  postal_code: z.string().trim().max(191).nullable(),
  postal_address: z.string().trim().max(191).nullable(),
  location: z.string().trim().max(191).nullable(),
  contact: z.string().trim().max(191).nullable(),
  tin: z.string().trim().max(20).nullable(),
  vrn: z.string().trim().max(20).nullable(),
  status: z.boolean(),
})

export type CustomerInput = z.infer<typeof customerSchema>
