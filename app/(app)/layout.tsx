import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'

import { auth, signOut } from '@/auth'

export const instant = false

const nav = [
  { href: '/', label: 'Dashboard' },
  { href: '/settings/customers', label: 'Customers' },
  { href: '/settings/suppliers', label: 'Suppliers' },
  { href: '/settings/items', label: 'Items' },
  { href: '/settings/item-categories', label: 'Categories' },
  { href: '/settings/currencies', label: 'Currencies' },
  { href: '/settings/packages', label: 'Packages' },
  { href: '/documents/proformas', label: 'Proformas' },
  { href: '/documents/invoices', label: 'Invoices' },
  { href: '/documents/delivery-notes', label: 'Delivery notes' },
]

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await auth()

  if (!session?.user) {
    redirect('/signin')
  }

  return (
    <div className="min-h-screen">
      <header className="sk-card mx-auto mt-4 flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <a href="/" className="text-lg font-bold">
          WeLink Sales
        </a>

        <nav className="flex flex-wrap items-center gap-1">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded px-2 py-1 text-sm text-gray-700 hover:bg-black/5"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">{session.user.name}</span>
          <form
            action={async () => {
              'use server'
              await signOut({ redirectTo: '/signin' })
            }}
          >
            <button type="submit" className="sk-btn-ghost">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto max-w-6xl">{children}</div>
    </div>
  )
}
