import { requireAbility } from '@/lib/auth/guard'
import { PackageForm } from '../form'

export const instant = false

export default async function NewPackagePage() {
  await requireAbility('package_store')

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">New package</h1>
      <PackageForm />
    </main>
  )
}
