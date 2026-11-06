import { z } from 'zod'

export const userCreateSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(300),
    email: z.string().trim().email('Enter a valid email').max(300),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string().min(1, 'Confirm the password'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  })

export const userUpdateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(300),
  email: z.string().trim().email('Enter a valid email').max(300),
})

export const profileSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(300),
  email: z.string().trim().email('Enter a valid email').max(300),
  location: z.string().optional(),
  skills: z.string().optional(),
  notes: z.string().optional(),
  education: z.string().optional(),
})

export const passwordChangeSchema = z
  .object({
    old_password: z.string().min(1, 'Current password is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string().min(1, 'Confirm the password'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  })

export type UserCreateInput = z.infer<typeof userCreateSchema>
export type UserUpdateInput = z.infer<typeof userUpdateSchema>
export type ProfileInput = z.infer<typeof profileSchema>
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>
