import { z } from 'zod'

export const accountSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  description: z.string().trim().min(1, 'Description is required').max(300),
  active: z.boolean(),
})

export type AccountInput = z.infer<typeof accountSchema>
