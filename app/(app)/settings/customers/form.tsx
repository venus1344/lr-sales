'use client'

import { useActionState } from 'react'
import { useFormToast } from '@/components/toast'

import { createCustomer, updateCustomer, type CustomerFormState } from './actions'

export type CustomerFormProps = {
  customer?: {
    id: string
    name: string
    postal_code: string | null
    postal_address: string | null
    location: string | null
    contact: string | null
    tin: string | null
    vrn: string | null
    status: boolean
  }
}

const input = 'sk-input'

export function CustomerForm({ customer }: CustomerFormProps) {
  const action = customer ? updateCustomer.bind(null, customer.id) : createCustomer

  const [state, formAction, pending] = useActionState<CustomerFormState, FormData>(
    action,
    { error: undefined },
  )
  useFormToast(state)

  return (
    <form action={formAction} className="space-y-4">
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
        <input id="name" name="name" required defaultValue={customer?.name} className={input} />
      </div>
      <div>
        <label htmlFor="contact" className="block text-sm font-medium text-gray-700">Contact</label>
        <input id="contact" name="contact" defaultValue={customer?.contact ?? ''} className={input} />
      </div>
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
        <input id="location" name="location" defaultValue={customer?.location ?? ''} className={input} />
      </div>
      <div>
        <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">Postal code</label>
        <input id="postal_code" name="postal_code" defaultValue={customer?.postal_code ?? ''} className={input} />
      </div>
      <div>
        <label htmlFor="postal_address" className="block text-sm font-medium text-gray-700">Postal address</label>
        <input id="postal_address" name="postal_address" defaultValue={customer?.postal_address ?? ''} className={input} />
      </div>
      <div>
        <label htmlFor="tin" className="block text-sm font-medium text-gray-700">TIN</label>
        <input id="tin" name="tin" maxLength={20} defaultValue={customer?.tin ?? ''} placeholder="9 digits" className={input} />
      </div>
      <div>
        <label htmlFor="vrn" className="block text-sm font-medium text-gray-700">VRN</label>
        <input id="vrn" name="vrn" maxLength={20} defaultValue={customer?.vrn ?? ''} placeholder="9 chars" className={input} />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" name="status" defaultChecked={customer ? customer.status : true} className="rounded border-gray-300" />
        Active
      </label>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={pending} className="sk-btn disabled:opacity-50">
          Save
        </button>
        <a href={customer ? `/settings/customers/${customer.id}` : '/settings/customers'} className="text-sm text-gray-500 hover:text-gray-700">Cancel</a>
      </div>
    </form>
  )
}
