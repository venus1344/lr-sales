import type { Session } from 'next-auth'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { userHasAbility } from '@/lib/auth/rbac'

/**
 * Require an authenticated session; redirect to sign-in otherwise.
 */
export async function requireUser(): Promise<Session> {
  const session = await auth()

  if (!session?.user) {
    redirect('/signin')
  }

  return session
}

/**
 * Require the current user to hold the given ability; redirect to sign-in if
 * unauthenticated, or to the home page if unauthorized. Returns the session.
 */
export async function requireAbility(ability: string): Promise<Session> {
  const session = await requireUser()

  if (!(await userHasAbility(session, ability))) {
    redirect('/')
  }

  return session
}
