import { z } from 'zod'

export const roleSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  description: z.string().trim().min(1, 'Description is required').max(500),
})

export type RoleInput = z.infer<typeof roleSchema>
