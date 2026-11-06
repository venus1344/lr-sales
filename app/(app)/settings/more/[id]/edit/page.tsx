import { notFound } from 'next/navigation'

import { requireAbility } from '@/lib/auth/guard'
import { prisma } from '@/lib/prisma'
import { SettingEditForm } from '../../form'

export const instant = false

export default async function EditSettingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await requireAbility('set_settings')

  const setting = await prisma.settings.findUnique({
    where: { id: BigInt(id) },
    include: {
      setting_changelog: { include: { users: true }, orderBy: { id: 'desc' } },
    },
  })

  if (!setting) {
    notFound()
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Edit setting</h1>
      <SettingEditForm setting={{ id: String(setting.id), name: setting.name, value: setting.value }} />

      {setting.setting_changelog.length > 0 ? (
        <div className="sk-card mt-6 p-4">
          <h2 className="mb-3 font-semibold">Change history</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="sk-table-head text-left">
                <th className="px-2 py-2">When</th>
                <th className="px-2 py-2">By</th>
                <th className="px-2 py-2 text-right">From</th>
                <th className="px-2 py-2 text-right">To</th>
              </tr>
            </thead>
            <tbody>
              {setting.setting_changelog.map((entry) => (
                <tr key={String(entry.id)} className="border-b last:border-0">
                  <td className="px-2 py-2">
                    {entry.created_at
                      ? entry.created_at.toISOString().slice(0, 19).replace('T', ' ')
                      : '—'}
                  </td>
                  <td className="px-2 py-2">{entry.users?.name ?? 'system'}</td>
                  <td className="px-2 py-2 text-right">{entry.from}</td>
                  <td className="px-2 py-2 text-right">{entry.to}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </main>
  )
}
