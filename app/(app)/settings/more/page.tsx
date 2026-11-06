import Link from 'next/link'

import { ClickableRow } from '@/components/clickable-row'
import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'

export const instant = false

export default async function GeneralSettingsPage() {
  await requireAbility('view_settings')

  const settings = await prisma.settings.findMany({ orderBy: { id: 'asc' } })

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">General settings</h1>
        <Link href="/settings/more/new" className="sk-btn">New setting</Link>
      </div>

      <div className="sk-card mt-4 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="sk-table-head text-left">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2 text-right">Value</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {settings.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-400">No settings configured.</td>
              </tr>
            ) : (
              settings.map((setting) => (
                <ClickableRow key={String(setting.id)} href={`/settings/more/${setting.id}/edit`}>
                  <td className="px-4 py-2 font-medium capitalize">{setting.name.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-2 text-right">{setting.value}</td>
                  <td className="px-4 py-2 text-right">
                    <Link href={`/settings/more/${setting.id}/edit`} className="sk-link">Edit</Link>
                  </td>
                </ClickableRow>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}
