import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'

import { auth, signOut } from '@/auth'

export const instant = false

const sections = [
  {
    title: 'Main',
    items: [{ href: '/', label: 'Dashboard' }],
  },
  {
    title: 'Settings',
    items: [
      { href: '/settings/customers', label: 'Customers' },
      { href: '/settings/suppliers', label: 'Suppliers' },
      { href: '/settings/items', label: 'Items' },
      { href: '/settings/item-categories', label: 'Categories' },
      { href: '/settings/currencies', label: 'Currencies' },
      { href: '/settings/packages', label: 'Packages' },
    ],
  },
  {
    title: 'Documents',
    items: [
      { href: '/documents/proformas', label: 'Proformas' },
      { href: '/documents/invoices', label: 'Invoices' },
      { href: '/documents/delivery-notes', label: 'Delivery notes' },
      { href: '/documents/lpos', label: 'LPOs' },
    ],
  },
]

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await auth()

  if (!session?.user) {
    redirect('/signin')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="no-print hidden w-60 flex-col border-r border-gray-200 bg-white md:flex">
        <div className="border-b border-gray-100 px-5 py-4">
          <p className="text-base font-bold">WeLink Sales</p>
          <p className="text-xs text-gray-500">Invoicing &amp; Sales</p>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {sections.map((section) => (
            <div key={section.title}>
              <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="block rounded-lg px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-gray-100 p-4">
          <p className="text-sm font-medium text-gray-900">{session.user.name}</p>
          <p className="mb-3 truncate text-xs text-gray-500">{session.user.email}</p>
          <form
            action={async () => {
              'use server'
              await signOut({ redirectTo: '/signin' })
            }}
          >
            <button type="submit" className="sk-btn-ghost w-full">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="no-print flex items-center justify-between gap-4 border-b border-gray-200 bg-white px-6 py-3">
          <input className="sk-input max-w-xs" placeholder="Search…" aria-label="Search" />
          <span className="text-sm text-gray-600">{session.user.name}</span>
        </header>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
