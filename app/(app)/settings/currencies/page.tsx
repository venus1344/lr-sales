import Link from 'next/link'

import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { deleteCurrency } from './actions'

export const instant = false

export default async function CurrenciesPage() {
  await requireAbility('currency_list')

  const currencies = await prisma.currencies.findMany({ orderBy: { name: 'asc' } })

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Currencies</h1>
        <Link
          href="/settings/currencies/new"
          className="sk-btn"
        >
          New currency
        </Link>
      </div>

      <div className="sk-card mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="sk-table-head text-left">
              <th className="px-4 py-2">Code</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Rate</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currencies.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                  No currencies yet.
                </td>
              </tr>
            ) : (
              currencies.map((currency) => (
                <tr key={String(currency.id)} className="border-b last:border-0">
                  <td className="px-4 py-2 font-medium">{currency.code}</td>
                  <td className="px-4 py-2">{currency.name}</td>
                  <td className="px-4 py-2">{currency.rate}</td>
                  <td className="px-4 py-2"><span className={currency.active ? 'sk-badge sk-badge-on' : 'sk-badge sk-badge-off'}>{currency.active ? 'Active' : 'Inactive'}</span></td>
                  <td className="px-4 py-2 text-right">
                    <Link
                      href={`/settings/currencies/${currency.id}/edit`}
                      className="mr-3 sk-link"
                    >
                      Edit
                    </Link>
                    <form action={deleteCurrency.bind(null, String(currency.id))} className="inline">
                      <button type="submit" className="sk-link-danger">
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}
