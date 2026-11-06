'use client'

import { useActionState } from 'react'
import { useFormToast } from '@/components/toast'

import { createExpense, updateExpense, type ExpenseFormState } from './actions'

export type Option = { id: string; name: string }

export type ExpenseFormProps = {
  users: Option[]
  incomeAccounts: Option[]
  expenseAccounts: Option[]
  projects: Option[]
  expense?: {
    id: string
    requested_by: string
    income_account_id: string
    expense_account_id: string
    project_id: string | null
    receipt_number: string
    amount: number
    narration: string
    receipt: string | null
  }
}

const input = 'sk-input'
const label = 'block text-sm font-medium text-gray-700'

export function ExpenseForm({
  users,
  incomeAccounts,
  expenseAccounts,
  projects,
  expense,
}: ExpenseFormProps) {
  const action = expense ? updateExpense.bind(null, expense.id) : createExpense

  const [state, formAction, pending] = useActionState<ExpenseFormState, FormData>(action, {
    error: undefined,
  })
  useFormToast(state)

  return (
    <form action={formAction} className="space-y-4">
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="requested_by" className={label}>Requested by</label>
          <select id="requested_by" name="requested_by" required defaultValue={expense?.requested_by ?? ''} className={input}>
            <option value="" disabled>Select a user</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="income_account_id" className={label}>Income account</label>
          <select id="income_account_id" name="income_account_id" required defaultValue={expense?.income_account_id ?? ''} className={input}>
            <option value="" disabled>Select an income account</option>
            {incomeAccounts.map((account) => (
              <option key={account.id} value={account.id}>{account.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="expense_account_id" className={label}>Expense account</label>
          <select id="expense_account_id" name="expense_account_id" required defaultValue={expense?.expense_account_id ?? ''} className={input}>
            <option value="" disabled>Select an expense account</option>
            {expenseAccounts.map((account) => (
              <option key={account.id} value={account.id}>{account.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="project_id" className={label}>Project</label>
          <select id="project_id" name="project_id" defaultValue={expense?.project_id ?? ''} className={input}>
            <option value="">— none —</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="receipt_number" className={label}>Receipt number</label>
          <input id="receipt_number" name="receipt_number" required maxLength={50} defaultValue={expense?.receipt_number} className={input} />
        </div>

        <div>
          <label htmlFor="amount" className={label}>Amount</label>
          <input id="amount" name="amount" type="number" step="0.01" min="0" required defaultValue={expense?.amount} className={input} />
        </div>
      </div>

      <div>
        <label htmlFor="narration" className={label}>Narration</label>
        <textarea id="narration" name="narration" rows={2} required maxLength={800} defaultValue={expense?.narration} className={input} />
      </div>

      <div>
        <label htmlFor="receipt" className={label}>Receipt file</label>
        <input id="receipt" name="receipt" type="file" accept=".pdf,image/*" className={input} />
        {expense?.receipt ? (
          <p className="mt-1 text-xs text-gray-500">
            Current:{' '}
            <a href={expense.receipt} target="_blank" rel="noopener" className="sk-link">
              view receipt
            </a>{' '}
            — leave empty to keep it.
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={pending} className="sk-btn disabled:opacity-50">Save</button>
        <a href="/expenses" className="text-sm text-gray-500 hover:text-gray-700">Cancel</a>
      </div>
    </form>
  )
}
