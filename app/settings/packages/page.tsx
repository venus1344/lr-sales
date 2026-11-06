import Link from 'next/link'

import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { deletePackage } from './actions'

export const instant = false

export default async function PackagesPage() {
  await requireAbility('package_list')

  const packages = await prisma.packages.findMany({ orderBy: { name: 'asc' } })

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Packages</h1>
        <Link
          href="/settings/packages/new"
          className="sk-btn"
        >
          New package
        </Link>
      </div>

      <div className="sk-card mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="sk-table-head text-left">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Price</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {packages.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                  No packages yet.
                </td>
              </tr>
            ) : (
              packages.map((pkg) => (
                <tr key={String(pkg.id)} className="border-b last:border-0">
                  <td className="px-4 py-2 font-medium">{pkg.name}</td>
                  <td className="px-4 py-2">{pkg.description}</td>
                  <td className="px-4 py-2">{pkg.price}</td>
                  <td className="px-4 py-2"><span className={pkg.status ? 'sk-badge sk-badge-on' : 'sk-badge sk-badge-off'}>{pkg.status ? 'Active' : 'Inactive'}</span></td>
                  <td className="px-4 py-2 text-right">
                    <Link
                      href={`/settings/packages/${pkg.id}/edit`}
                      className="mr-3 sk-link"
                    >
                      Edit
                    </Link>
                    <form action={deletePackage.bind(null, String(pkg.id))} className="inline">
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
