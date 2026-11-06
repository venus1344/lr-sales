import { z } from 'zod'

const numeric = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.coerce.number().finite().min(0, 'Value must be zero or greater'),
)

export const settingSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  value: numeric,
})

export const settingValueSchema = z.object({
  value: numeric,
})

export type SettingInput = z.infer<typeof settingSchema>
export type SettingValueInput = z.infer<typeof settingValueSchema>
