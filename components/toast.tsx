'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'

import { TOAST_COOKIE } from '@/lib/toast-cookie'

export type ToastType = 'success' | 'error'

type Toast = { id: number; message: string; type: ToastType }

type ToastContextValue = { push: (message: string, type?: ToastType) => void }

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const value = useContext(ToastContext)
  if (!value) {
    throw new Error('useToast must be used within <ToastProvider>')
  }
  return value
}

/** Turn the result of an action state into a success or error toast. */
export function useFormToast(state: { error?: string; success?: string } | undefined): void {
  const { push } = useToast()
  useEffect(() => {
    if (state?.error) {
      push(state.error, 'error')
    } else if (state?.success) {
      push(state.success, 'success')
    }
  }, [state, push])
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(0)

  const push = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++nextId.current
    setToasts((prev) => [...prev, { id, message, type }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 4000)
  }, [])

  useFlashToast(push)

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div
        aria-live="polite"
        className="no-print pointer-events-none fixed right-4 bottom-4 z-50 flex w-full max-w-sm flex-col gap-2"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={
              toast.type === 'error'
                ? 'pointer-events-auto rounded-lg border border-red-200 bg-white px-4 py-3 text-sm text-red-700 shadow-lg'
                : 'pointer-events-auto rounded-lg border border-green-200 bg-white px-4 py-3 text-sm text-green-700 shadow-lg'
            }
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

/** Show the toast queued by a redirecting server action, then clear it. */
function useFlashToast(push: (message: string, type?: ToastType) => void): void {
  const pathname = usePathname()

  useEffect(() => {
    const prefix = `${TOAST_COOKIE}=`
    const match = document.cookie.split('; ').find((cookie) => cookie.startsWith(prefix))
    if (!match) return

    document.cookie = `${TOAST_COOKIE}=; Max-Age=0; path=/`

    try {
      const value = JSON.parse(decodeURIComponent(match.slice(prefix.length))) as {
        message?: unknown
        type?: unknown
      }
      if (typeof value.message === 'string') {
        push(value.message, value.type === 'error' ? 'error' : 'success')
      }
    } catch {
      // Ignore a malformed toast cookie.
    }
  }, [pathname, push])
}
