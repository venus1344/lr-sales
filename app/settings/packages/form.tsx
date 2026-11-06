'use client'

import { useActionState } from 'react'

import { createPackage, updatePackage, type PackageFormState } from './actions'

export type PackageFormProps = {
  pkg?: {
    id: string
    name: string
    description: string
    price: number
    status: boolean
  }
}

export function PackageForm({ pkg }: PackageFormProps) {
  const action = pkg ? updatePackage.bind(null, pkg.id) : createPackage

  const [state, formAction, pending] = useActionState<PackageFormState, FormData>(
    action,
    { error: undefined },
  )

  return (
    <form action={formAction} className="space-y-4">
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={pkg?.name}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={2}
          required
          defaultValue={pkg?.description}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
          Price
        </label>
        <input
          id="price"
          name="price"
          type="number"
          step="0.01"
          required
          defaultValue={pkg?.price}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          name="status"
          defaultChecked={pkg ? pkg.status : true}
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
        <a href="/settings/packages" className="text-sm text-gray-500 hover:text-gray-700">
          Cancel
        </a>
      </div>
    </form>
  )
}
