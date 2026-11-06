'use client'

import { useActionState } from 'react'

import { createExpenseAccount, updateExpenseAccount, type AccountFormState } from './actions'

export type ExpenseAccountFormProps = {
  account?: {
    id: string
    name: string
    description: string
    active: boolean
  }
}

export function ExpenseAccountForm({ account }: ExpenseAccountFormProps) {
  const action = account ? updateExpenseAccount.bind(null, account.id) : createExpenseAccount

  const [state, formAction, pending] = useActionState<AccountFormState, FormData>(action, {
    error: undefined,
  })

  return (
    <form action={formAction} className="space-y-4">
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
        <input id="name" name="name" required maxLength={200} defaultValue={account?.name} className="sk-input" />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea id="description" name="description" required maxLength={300} rows={2} defaultValue={account?.description} className="sk-input" />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" name="active" defaultChecked={account ? account.active : true} className="rounded border-gray-300" />
        Active
      </label>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={pending} className="sk-btn disabled:opacity-50">Save</button>
        <a href="/settings/accounts/expense" className="text-sm text-gray-500 hover:text-gray-700">Cancel</a>
      </div>
    </form>
  )
}
