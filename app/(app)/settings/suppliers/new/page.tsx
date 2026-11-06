import { requireAbility } from '@/lib/auth/guard'
import { SupplierForm } from '../form'

export const instant = false

export default async function NewSupplierPage() {
  await requireAbility('supplier_store')

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">New supplier</h1>
      <SupplierForm />
    </main>
  )
}
