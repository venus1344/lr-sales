'use client'

import { useActionState } from 'react'

import { createCurrency, updateCurrency, type CurrencyFormState } from './actions'

export type CurrencyFormProps = {
  currency?: {
    id: string
    code: string
    name: string
    rate: number
    active: boolean
  }
}

export function CurrencyForm({ currency }: CurrencyFormProps) {
  const action = currency
    ? updateCurrency.bind(null, currency.id)
    : createCurrency

  const [state, formAction, pending] = useActionState<CurrencyFormState, FormData>(
    action,
    { error: undefined },
  )

  return (
    <form action={formAction} className="space-y-4">
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div>
        <label htmlFor="code" className="block text-sm font-medium text-gray-700">
          Code
        </label>
        <input
          id="code"
          name="code"
          required
          maxLength={3}
          defaultValue={currency?.code}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={currency?.name}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="rate" className="block text-sm font-medium text-gray-700">
          Rate
        </label>
        <input
          id="rate"
          name="rate"
          type="number"
          step="0.01"
          required
          defaultValue={currency?.rate}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          name="active"
          defaultChecked={currency ? currency.active : true}
          className="rounded border-gray-300"
        />
        Active
      </label>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          Save
        </button>
        <a href="/settings/currencies" className="text-sm text-gray-500 hover:text-gray-700">
          Cancel
        </a>
      </div>
    </form>
  )
}
