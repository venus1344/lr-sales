import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'

import { auth, signOut } from '@/auth'
import { Breadcrumbs } from '@/components/breadcrumbs'
import {
  IconAccounts,
  IconCategories,
  IconCurrencies,
  IconCustomers,
  IconDashboard,
  IconDeliveryNotes,
  IconExpenses,
  IconInvoices,
  IconItems,
  IconLpos,
  IconPackages,
  IconProformas,
  IconSettings,
  IconSuppliers,
} from '@/components/icons'

export const instant = false

const sections = [
  {
    title: 'Main',
    items: [{ href: '/', label: 'Dashboard', icon: IconDashboard }],
  },
  {
    title: 'Documents',
    items: [
      { href: '/documents/proformas', label: 'Proformas', icon: IconProformas },
      { href: '/documents/invoices', label: 'Invoices', icon: IconInvoices },
      { href: '/documents/delivery-notes', label: 'Delivery notes', icon: IconDeliveryNotes },
      { href: '/documents/lpos', label: 'LPOs', icon: IconLpos },
    ],
  },
  {
    title: 'Finance',
    items: [{ href: '/expenses', label: 'Expenses', icon: IconExpenses }],
  },
  {
    title: 'Settings',
    items: [
      { href: '/settings/customers', label: 'Customers', icon: IconCustomers },
      { href: '/settings/suppliers', label: 'Suppliers', icon: IconSuppliers },
      { href: '/settings/items', label: 'Items', icon: IconItems },
      { href: '/settings/item-categories', label: 'Categories', icon: IconCategories },
      { href: '/settings/currencies', label: 'Currencies', icon: IconCurrencies },
      { href: '/settings/packages', label: 'Packages', icon: IconPackages },
      { href: '/settings/accounts', label: 'Accounts', icon: IconAccounts },
    ],
  },
]

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await auth()

  if (!session?.user) {
    redirect('/signin')
  }

  return (
    <div className="app-shell flex h-screen bg-gray-50">
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
                {section.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Icon className="h-4 w-4 shrink-0 text-gray-400" />
                      <span className="truncate">{item.label}</span>
                    </a>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-gray-100 p-4">
          <a
            href="/admin"
            className="mb-3 flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
          >
            <IconSettings className="h-4 w-4 shrink-0 text-gray-400" />
            <span className="truncate">Administration</span>
          </a>
          <p className="text-sm font-medium text-gray-900">{session.user.name}</p>
          <p className="truncate text-xs text-gray-500">{session.user.email}</p>
          <a
            href="/settings/profile#password"
            className="mb-3 block text-xs font-medium text-gray-600 hover:text-gray-900"
          >
            Change password
          </a>
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

      <div className="app-content flex min-w-0 flex-1 flex-col">
        <header className="no-print flex items-center justify-between gap-4 border-b border-gray-200 bg-white px-6 py-3">
          <Breadcrumbs />
          <div className="flex items-center gap-4">
            <input className="sk-input hidden max-w-xs md:block" placeholder="Search…" aria-label="Search" />
            <span className="text-sm text-gray-600">{session.user.name}</span>
          </div>
        </header>

        <main className="app-main min-h-0 min-w-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
