import Link from 'next/link'

import { ClickableRow } from '@/components/clickable-row'
import { Pagination } from '@/components/pagination'
import { SearchForm } from '@/components/search-form'
import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'

export const instant = false

const PAGE_SIZE = 15

export default async function PackagesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  await requireAbility('package_list')

  const { q = '', page = '1' } = await searchParams
  const pageNum = Math.max(1, Number(page) || 1)
  const where = q ? { name: { contains: q } } : undefined

  const [packages, total] = await Promise.all([
    prisma.packages.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: (pageNum - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.packages.count({ where }),
  ])

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Packages</h1>
        <Link href="/settings/packages/new" className="sk-btn">New package</Link>
      </div>

      <div className="mt-4">
        <SearchForm placeholder="Search packages…" defaultValue={q} />
      </div>

      <div className="sk-card mt-4 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="sk-table-head text-left">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Price</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {packages.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">No packages found.</td>
              </tr>
            ) : (
              packages.map((pkg) => (
                <ClickableRow key={String(pkg.id)} href={`/settings/packages/${pkg.id}`}>
                  <td className="px-4 py-2 font-medium">{pkg.name}</td>
                  <td className="px-4 py-2">{pkg.description}</td>
                  <td className="px-4 py-2">{pkg.price}</td>
                  <td className="px-4 py-2">{pkg.status ? 'Active' : 'Inactive'}</td>
                </ClickableRow>
              ))
            )}
          </tbody>
        </table>
        <Pagination page={pageNum} total={total} pageSize={PAGE_SIZE} query={q} />
      </div>
    </main>
  )
}
