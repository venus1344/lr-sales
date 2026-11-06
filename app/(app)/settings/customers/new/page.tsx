import { requireAbility } from '@/lib/auth/guard'
import { CustomerForm } from '../form'

export const instant = false

export default async function NewCustomerPage() {
  await requireAbility('customer_store')

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">New customer</h1>
      <CustomerForm />
    </main>
  )
}
