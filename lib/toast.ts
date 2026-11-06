import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { TOAST_COOKIE } from './toast-cookie'

export type ToastType = 'success' | 'error'

/**
 * Queue a toast the browser will show on the next page it renders. Used by
 * server actions that redirect, where there is no client state to read back.
 */
export async function setToast(message: string, type: ToastType = 'success'): Promise<void> {
  const store = await cookies()
  store.set({
    name: TOAST_COOKIE,
    value: JSON.stringify({ message, type }),
    path: '/',
    maxAge: 30,
    httpOnly: false,
    sameSite: 'lax',
  })
}

/** Set a toast and navigate to `path` in one step. */
export async function redirectWithToast(
  path: string,
  message: string,
  type: ToastType = 'success',
): Promise<never> {
  await setToast(message, type)
  redirect(path)
}
