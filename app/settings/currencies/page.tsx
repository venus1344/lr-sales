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
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          New currency
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-md border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-gray-500">
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
                  <td className="px-4 py-2">{currency.active ? 'Active' : 'Inactive'}</td>
                  <td className="px-4 py-2 text-right">
                    <Link
                      href={`/settings/currencies/${currency.id}/edit`}
                      className="mr-3 text-blue-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <form action={deleteCurrency.bind(null, String(currency.id))} className="inline">
                      <button type="submit" className="text-red-600 hover:underline">
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
