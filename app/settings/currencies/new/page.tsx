import { requireAbility } from '@/lib/auth/guard'
import { CurrencyForm } from '../form'

export const instant = false

export default async function NewCurrencyPage() {
  await requireAbility('currency_store')

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">New currency</h1>
      <CurrencyForm />
    </main>
  )
}
