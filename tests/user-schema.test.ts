import { describe, expect, it } from 'vitest'

import {
  passwordChangeSchema,
  profileSchema,
  userCreateSchema,
  userPasswordResetSchema,
  userUpdateSchema,
} from '../lib/validation/user'

describe('userCreateSchema', () => {
  it('accepts matching passwords', () => {
    const result = userCreateSchema.safeParse({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password123',
      password_confirmation: 'password123',
    })

    expect(result.success).toBe(true)
  })

  it('rejects mismatched passwords', () => {
    const result = userCreateSchema.safeParse({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password123',
      password_confirmation: 'different',
    })

    expect(result.success).toBe(false)
  })

  it('rejects a password shorter than 8 characters', () => {
    const result = userCreateSchema.safeParse({
      name: 'Jane',
      email: 'jane@example.com',
      password: 'short',
      password_confirmation: 'short',
    })

    expect(result.success).toBe(false)
  })

  it('rejects an invalid email', () => {
    const result = userCreateSchema.safeParse({
      name: 'Jane',
      email: 'not-an-email',
      password: 'password123',
      password_confirmation: 'password123',
    })

    expect(result.success).toBe(false)
  })
})

describe('userUpdateSchema', () => {
  it('accepts name and email without a password', () => {
    const result = userUpdateSchema.safeParse({ name: 'Jane', email: 'jane@example.com' })
    expect(result.success).toBe(true)
  })
})

describe('profileSchema', () => {
  it('accepts optional profile fields', () => {
    const result = profileSchema.safeParse({ name: 'Jane', email: 'jane@example.com' })
    expect(result.success).toBe(true)
  })
})

describe('userPasswordResetSchema', () => {
  it('accepts matching passwords', () => {
    const result = userPasswordResetSchema.safeParse({
      password: 'newpass12',
      password_confirmation: 'newpass12',
    })
    expect(result.success).toBe(true)
  })

  it('rejects mismatched passwords', () => {
    const result = userPasswordResetSchema.safeParse({
      password: 'newpass12',
      password_confirmation: 'other',
    })
    expect(result.success).toBe(false)
  })

  it('rejects a password shorter than 8 characters', () => {
    const result = userPasswordResetSchema.safeParse({
      password: 'short',
      password_confirmation: 'short',
    })
    expect(result.success).toBe(false)
  })
})

describe('passwordChangeSchema', () => {
  it('accepts a valid password change', () => {
    const result = passwordChangeSchema.safeParse({
      old_password: 'oldpass1',
      password: 'newpass12',
      password_confirmation: 'newpass12',
    })
    expect(result.success).toBe(true)
  })

  it('rejects mismatched new passwords', () => {
    const result = passwordChangeSchema.safeParse({
      old_password: 'oldpass1',
      password: 'newpass12',
      password_confirmation: 'other',
    })
    expect(result.success).toBe(false)
  })
})

