import { z } from 'zod'

export const itemCategorySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  description: z.string().max(1000).nullable(),
  active: z.boolean(),
})

export type ItemCategoryInput = z.infer<typeof itemCategorySchema>
