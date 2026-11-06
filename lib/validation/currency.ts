import { z } from 'zod'

export const currencySchema = z.object({
  code: z.string().trim().length(3, 'Code must be exactly 3 letters'),
  name: z.string().trim().min(1, 'Name is required').max(60),
  rate: z.coerce.number().min(0, 'Rate must be zero or more'),
  active: z.boolean(),
})

export type CurrencyInput = z.infer<typeof currencySchema>
