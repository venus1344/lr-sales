'use client'

import { useActionState } from 'react'
import { useFormToast } from '@/components/toast'

import { createItemCategory, updateItemCategory, type ItemCategoryFormState } from './actions'

export type ItemCategoryFormProps = {
  category?: {
    id: string
    name: string
    description: string | null
    active: boolean
  }
}

export function ItemCategoryForm({ category }: ItemCategoryFormProps) {
  const action = category
    ? updateItemCategory.bind(null, category.id)
    : createItemCategory

  const [state, formAction, pending] = useActionState<ItemCategoryFormState, FormData>(
    action,
    { error: undefined },
  )
  useFormToast(state)

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
          defaultValue={category?.name}
          className="sk-input"
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
          defaultValue={category?.description ?? ''}
          className="sk-input"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          name="active"
          defaultChecked={category ? category.active : true}
          className="rounded border-gray-300"
        />
        Active
      </label>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="sk-btn disabled:opacity-50"
        >
          Save
        </button>
        <a href={category ? `/settings/item-categories/${category.id}` : '/settings/item-categories'} className="text-sm text-gray-500 hover:text-gray-700">
          Cancel
        </a>
      </div>
    </form>
  )
}
