import Link from 'next/link'

import { requireUser } from '@/lib/auth/guard'

export const instant = false

export default async function AccountsPage() {
  await requireUser()

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Accounts</h1>
      <p className="mt-1 text-sm text-gray-500">
        Manage the income and expense accounts that expenses are recorded against.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link href="/settings/accounts/income" className="sk-card p-5 hover:bg-gray-50">
          <span className="block font-medium">Income accounts</span>
          <span className="mt-0.5 block text-sm text-gray-500">
            Sources of income used to fund expenses.
          </span>
        </Link>
        <Link href="/settings/accounts/expense" className="sk-card p-5 hover:bg-gray-50">
          <span className="block font-medium">Expense accounts</span>
          <span className="mt-0.5 block text-sm text-gray-500">
            Categories an expense is charged against.
          </span>
        </Link>
      </div>
    </main>
  )
}
