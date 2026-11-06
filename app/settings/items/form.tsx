'use client'

import { useActionState } from 'react'

import { createItem, updateItem, type ItemFormState } from './actions'

export type ItemFormProps = {
  item?: {
    id: string
    category_id: string
    name: string
    unit_measure: string | null
    specification: string | null
    price: number
    active: boolean
    vat: boolean
  }
  categories: { id: string; name: string }[]
}

const input = 'sk-input'

export function ItemForm({ item, categories }: ItemFormProps) {
  const action = item ? updateItem.bind(null, item.id) : createItem

  const [state, formAction, pending] = useActionState<ItemFormState, FormData>(
    action,
    { error: undefined },
  )

  return (
    <form action={formAction} className="space-y-4">
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div>
        <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">Category</label>
        <select id="category_id" name="category_id" required defaultValue={item?.category_id ?? ''} className={input}>
          <option value="" disabled>Select category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
        <input id="name" name="name" required defaultValue={item?.name} className={input} />
      </div>
      <div>
        <label htmlFor="unit_measure" className="block text-sm font-medium text-gray-700">Unit of measure</label>
        <input id="unit_measure" name="unit_measure" defaultValue={item?.unit_measure ?? ''} placeholder="pcs" className={input} />
      </div>
      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
        <input id="price" name="price" type="number" step="0.01" required defaultValue={item?.price} className={input} />
      </div>
      <div>
        <label htmlFor="specification" className="block text-sm font-medium text-gray-700">Specification</label>
        <textarea id="specification" name="specification" rows={2} defaultValue={item?.specification ?? ''} className={input} />
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" name="vat" defaultChecked={item ? item.vat : true} className="rounded border-gray-300" />
          VAT applicable
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" name="active" defaultChecked={item ? item.active : true} className="rounded border-gray-300" />
          Active
        </label>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={pending} className="sk-btn disabled:opacity-50">
          Save
        </button>
        <a href="/settings/items" className="text-sm text-gray-500 hover:text-gray-700">Cancel</a>
      </div>
    </form>
  )
}
