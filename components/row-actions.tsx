'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { IconConvert, IconDots, IconEdit, IconPrint, IconTrash } from '@/components/icons'
import { useToast } from '@/components/toast'

const ICONS = {
  convert: IconConvert,
  print: IconPrint,
  edit: IconEdit,
  trash: IconTrash,
} as const

export type RowActionIcon = keyof typeof ICONS

export type RowAction =
  | { kind: 'link'; label: string; href: string; icon: RowActionIcon; danger?: boolean }
  | {
      kind: 'submit'
      label: string
      icon: RowActionIcon
      danger?: boolean
      submit: (id: string) => Promise<void>
      id: string
    }

const MENU_WIDTH = 176

function successMessage(label: string): string {
  const text = label.toLowerCase()
  if (text.includes('unblock')) return 'User unblocked'
  if (text.includes('block')) return 'User blocked'
  if (text.includes('delete') || text.includes('remove')) return 'Deleted'
  return 'Saved'
}

export function RowActions({ actions }: { actions: RowAction[] }) {
  const router = useRouter()
  const { push } = useToast()
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)
  const [pending, setPending] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  function toggle() {
    if (open) {
      setOpen(false)
      return
    }

    const rect = buttonRef.current?.getBoundingClientRect()
    if (!rect) return

    setPosition({
      top: rect.bottom + 4,
      left: Math.max(8, rect.right - MENU_WIDTH),
    })
    setOpen(true)
  }

  async function run(action: Extract<RowAction, { kind: 'submit' }>) {
    setPending(true)
    try {
      await action.submit(action.id)
      setOpen(false)
      push(successMessage(action.label), 'success')
      router.refresh()
    } catch {
      // Keep the menu open so the user can retry; auth/redirect errors are handled upstream.
      push('Could not complete the action', 'error')
    } finally {
      setPending(false)
    }
  }

  return (
    <div
      ref={wrapperRef}
      className="relative inline-block"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        ref={buttonRef}
        type="button"
        className="sk-icon-btn"
        aria-label="Actions"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggle}
      >
        <IconDots className="h-4 w-4" />
      </button>

      {open && position ? (
        <div
          className="sk-actions-menu"
          role="menu"
          style={{ top: position.top, left: position.left, width: MENU_WIDTH }}
        >
          {actions.map((action) => {
            const Icon = ICONS[action.icon]

            if (action.kind === 'link') {
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  role="menuitem"
                  className={`sk-actions-item ${action.danger ? 'is-danger' : ''}`}
                  onClick={() => setOpen(false)}
                >
                  <Icon className="h-4 w-4" />
                  <span>{action.label}</span>
                </Link>
              )
            }

            return (
              <button
                key={action.label}
                type="button"
                role="menuitem"
                disabled={pending}
                className={`sk-actions-item ${action.danger ? 'is-danger' : ''}`}
                onClick={() => void run(action)}
              >
                <Icon className="h-4 w-4" />
                <span>{action.label}</span>
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
