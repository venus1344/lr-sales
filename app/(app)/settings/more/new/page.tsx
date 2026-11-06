import { requireAbility } from '@/lib/auth/guard'
import { SettingForm } from '../form'

export const instant = false

export default async function NewSettingPage() {
  await requireAbility('set_settings')

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">New setting</h1>
      <SettingForm />
    </main>
  )
}
