import type { Session } from 'next-auth'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { userHasAbility } from '../lib/auth/rbac'

vi.mock('../lib/auth/ability', () => ({
  hasAbility: vi.fn(),
}))

import { hasAbility } from '../lib/auth/ability'

const mockHasAbility = vi.mocked(hasAbility)

function session(user: Partial<Session['user']> = {}): Session {
  return {
    user: {
      id: '1',
      super: false,
      name: 'Test User',
      email: 'test@example.com',
      ...user,
    },
    expires: '2030-01-01T00:00:00.000Z',
  }
}

describe('userHasAbility', () => {
  beforeEach(() => {
    mockHasAbility.mockReset()
  })

  it('returns false when there is no session', async () => {
    await expect(userHasAbility(null, 'invoice_store')).resolves.toBe(false)
  })

  it('returns true for a super admin regardless of ability', async () => {
    await expect(userHasAbility(session({ super: true }), 'nonexistent_ability')).resolves.toBe(true)
    expect(mockHasAbility).not.toHaveBeenCalled()
  })

  it('delegates to hasAbility for a non-super user', async () => {
    mockHasAbility.mockResolvedValue(true)

    await expect(userHasAbility(session(), 'invoice_store')).resolves.toBe(true)
    expect(mockHasAbility).toHaveBeenCalledWith('1', 'invoice_store')
  })

  it('returns false for a non-super user without the ability', async () => {
    mockHasAbility.mockResolvedValue(false)

    await expect(userHasAbility(session(), 'invoice_store')).resolves.toBe(false)
  })
})
