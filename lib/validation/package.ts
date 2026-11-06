import { z } from 'zod'

export const packageSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  description: z.string().trim().min(1, 'Description is required'),
  price: z.coerce.number().min(0, 'Price must be zero or more'),
  status: z.boolean(),
})

export type PackageInput = z.infer<typeof packageSchema>
