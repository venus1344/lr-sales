import Link from 'next/link'

import { IconEdit, IconTrash } from '@/components/icons'
import { Pagination } from '@/components/pagination'
import { SearchForm } from '@/components/search-form'
import { ActionButton, ActionLink } from '@/components/table-actions'
import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { deleteCurrency } from './actions'

export const instant = false

const PAGE_SIZE = 15

export default async function CurrenciesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  await requireAbility('currency_list')

  const { q = '', page = '1' } = await searchParams
  const pageNum = Math.max(1, Number(page) || 1)
  const where = q ? { name: { contains: q } } : undefined

  const [currencies, total] = await Promise.all([
    prisma.currencies.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: (pageNum - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.currencies.count({ where }),
  ])

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Currencies</h1>
        <Link href="/settings/currencies/new" className="sk-btn">New currency</Link>
      </div>

      <div className="mt-4">
        <SearchForm placeholder="Search currencies…" defaultValue={q} />
      </div>

      <div className="sk-card mt-4 overflow-hidden">
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
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">No currencies found.</td>
              </tr>
            ) : (
              currencies.map((currency) => (
                <tr key={String(currency.id)} className="border-b last:border-0">
                  <td className="px-4 py-2 font-medium">{currency.code}</td>
                  <td className="px-4 py-2">{currency.name}</td>
                  <td className="px-4 py-2">{currency.rate}</td>
                  <td className="px-4 py-2">{currency.active ? 'Active' : 'Inactive'}</td>
                  <td className="px-4 py-2 text-right">
                    <ActionLink href={`/settings/currencies/${currency.id}/edit`} icon={IconEdit} label="Edit" />
                    <form action={deleteCurrency.bind(null, String(currency.id))} className="inline">
                      <ActionButton icon={IconTrash} label="Delete" danger />
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination page={pageNum} total={total} pageSize={PAGE_SIZE} query={q} />
      </div>
    </main>
  )
}
