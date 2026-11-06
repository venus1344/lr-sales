import type { Session } from 'next-auth'

import { hasAbility } from './ability'

/**
 * Whether the current user holds the given ability.
 *
 * Super admins bypass all checks. An unauthenticated session always returns
 * false. Otherwise the user's role grants are queried.
 */
export async function userHasAbility(session: Session | null, ability: string): Promise<boolean> {
  if (!session?.user?.id) {
    return false
  }

  if (session.user.super) {
    return true
  }

  return hasAbility(session.user.id, ability)
}
