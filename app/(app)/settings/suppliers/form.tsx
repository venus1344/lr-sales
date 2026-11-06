'use client'

import { useActionState } from 'react'
import { useFormToast } from '@/components/toast'

import { createSupplier, updateSupplier, type SupplierFormState } from './actions'

export type SupplierFormProps = {
  supplier?: {
    id: string
    name: string
    location: string
    contacts: string
    postal_code: string | null
    postal_address: string | null
    tin: string | null
    vrn: string | null
    status: boolean
  }
}

function field(className = 'sk-input') {
  return className
}

export function SupplierForm({ supplier }: SupplierFormProps) {
  const action = supplier ? updateSupplier.bind(null, supplier.id) : createSupplier

  const [state, formAction, pending] = useActionState<SupplierFormState, FormData>(
    action,
    { error: undefined },
  )
  useFormToast(state)

  const input = field()

  return (
    <form action={formAction} className="space-y-4">
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
        <input id="name" name="name" required defaultValue={supplier?.name} className={input} />
      </div>
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
        <input id="location" name="location" required defaultValue={supplier?.location} className={input} />
      </div>
      <div>
        <label htmlFor="contacts" className="block text-sm font-medium text-gray-700">Contacts</label>
        <input id="contacts" name="contacts" required defaultValue={supplier?.contacts} className={input} />
      </div>
      <div>
        <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">Postal code</label>
        <input id="postal_code" name="postal_code" defaultValue={supplier?.postal_code ?? ''} className={input} />
      </div>
      <div>
        <label htmlFor="postal_address" className="block text-sm font-medium text-gray-700">Postal address</label>
        <input id="postal_address" name="postal_address" defaultValue={supplier?.postal_address ?? ''} className={input} />
      </div>
      <div>
        <label htmlFor="tin" className="block text-sm font-medium text-gray-700">TIN</label>
        <input id="tin" name="tin" maxLength={20} defaultValue={supplier?.tin ?? ''} placeholder="9 digits" className={input} />
      </div>
      <div>
        <label htmlFor="vrn" className="block text-sm font-medium text-gray-700">VRN</label>
        <input id="vrn" name="vrn" maxLength={20} defaultValue={supplier?.vrn ?? ''} placeholder="9 chars" className={input} />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" name="status" defaultChecked={supplier ? supplier.status : true} className="rounded border-gray-300" />
        Active
      </label>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={pending} className="sk-btn disabled:opacity-50">
          Save
        </button>
        <a href="/settings/suppliers" className="text-sm text-gray-500 hover:text-gray-700">Cancel</a>
      </div>
    </form>
  )
}
