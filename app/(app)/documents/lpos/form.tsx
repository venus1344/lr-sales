'use client'

import Link from 'next/link'
import { useActionState, useState } from 'react'
import { useFormToast } from '@/components/toast'

import { Combobox, type ComboboxOption } from '@/components/combobox'
import { IconTrash } from '@/components/icons'
import { createLpo, updateLpo, type LpoFormState } from './actions'

export type ItemOption = {
  id: string
  name: string
  specification: string | null
  price: number
}

export type SupplierOption = {
  id: string
  name: string
}

export type LpoLine = {
  item_id: string
  specification: string
  quantity: string
  price: string
}

export type LpoFormProps = {
  lpo?: {
    id?: string
    supplier_id: string
    date: string
    currency: string
    for: string | null
    proforma_referenced: string | null
    extra_notes: string | null
    vat: number
    withholding_tax: number
    lines: LpoLine[]
  }
  suppliers: SupplierOption[]
  items: ItemOption[]
}

type ItemData = {
  specification: string | null
  price: number | null
}

const input = 'sk-input'
const label = 'block text-sm font-medium text-gray-700'

export function LpoForm({ lpo, suppliers, items }: LpoFormProps) {
  const action = lpo?.id ? updateLpo.bind(null, lpo.id) : createLpo

  const [state, formAction, pending] = useActionState<LpoFormState, FormData>(
    action,
    { error: undefined },
  )
  useFormToast(state)

  const [lines, setLines] = useState<LpoLine[]>(lpo?.lines ?? [])
  const [labels, setLabels] = useState<Record<string, string>>(() =>
    Object.fromEntries(items.map((item) => [item.id, item.name])),
  )
  const [supplierId, setSupplierId] = useState(lpo?.supplier_id ?? '')

  function addLine() {
    setLines((prev) => [...prev, { item_id: '', specification: '', quantity: '1', price: '0' }])
  }

  function updateLine(index: number, field: keyof LpoLine, value: string) {
    setLines((prev) =>
      prev.map((line, i) => (i === index ? { ...line, [field]: value } : line)),
    )
  }

  function selectItem(index: number, option: ComboboxOption) {
    const data = option.data as ItemData | undefined
    setLabels((prev) => ({ ...prev, [option.value]: option.label }))
    setLines((prev) =>
      prev.map((line, i) => {
        if (i !== index) return line
        return {
          ...line,
          item_id: option.value,
          specification: data?.specification ?? line.specification,
          price: data?.price != null ? String(data.price) : line.price,
        }
      }),
    )
  }

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index))
  }

  const labelFor = (id: string) => labels[id] ?? ''
  const supplierLabel = suppliers.find((s) => s.id === supplierId)?.name ?? ''

  return (
    <form action={formAction} className="space-y-4">
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="supplier_id" className={label}>Supplier</label>
          <Combobox
            id="supplier_id"
            name="supplier_id"
            value={supplierId}
            label={supplierLabel}
            placeholder="Search suppliers…"
            searchUrl="/api/search/suppliers"
            createHref="/settings/suppliers/new"
            createLabel="Create supplier"
            onChange={(option) => setSupplierId(option.value)}
          />
        </div>
        <div>
          <label htmlFor="date" className={label}>Date</label>
          <input id="date" name="date" type="date" required defaultValue={lpo?.date} className={input} />
        </div>
        <div>
          <label htmlFor="currency" className={label}>Currency</label>
          <input id="currency" name="currency" required defaultValue={lpo?.currency ?? 'TZS'} className={input} />
        </div>
        <div>
          <label htmlFor="for" className={label}>Purpose</label>
          <input id="for" name="for" defaultValue={lpo?.for ?? ''} className={input} />
        </div>
        <div>
          <label htmlFor="proforma_referenced" className={label}>Proforma referenced</label>
          <input id="proforma_referenced" name="proforma_referenced" defaultValue={lpo?.proforma_referenced ?? ''} className={input} />
        </div>
        <div>
          <label htmlFor="extra_notes" className={label}>Extra notes</label>
          <input id="extra_notes" name="extra_notes" defaultValue={lpo?.extra_notes ?? ''} className={input} />
        </div>
        <div>
          <label htmlFor="vat" className={label}>VAT %</label>
          <input id="vat" name="vat" type="number" step="0.01" defaultValue={lpo?.vat ?? 18} className={input} />
        </div>
        <div>
          <label htmlFor="withholding_tax" className={label}>Withholding tax %</label>
          <input id="withholding_tax" name="withholding_tax" type="number" step="0.01" defaultValue={lpo?.withholding_tax ?? 2} className={input} />
        </div>
      </div>

      <div className="sk-card p-4">
        <h2 className="mb-3 font-semibold">Items</h2>
        <div className="space-y-2">
          {lines.map((line, i) => (
            <div key={i} className="grid grid-cols-12 gap-2">
              <Combobox
                className="col-span-4"
                value={line.item_id}
                label={labelFor(line.item_id)}
                placeholder="Item…"
                searchUrl="/api/search/items"
                createHref="/settings/items/new"
                createLabel="Create item"
                onChange={(option) => selectItem(i, option)}
              />
              <input
                className="sk-input col-span-3"
                placeholder="Specification"
                value={line.specification}
                onChange={(e) => updateLine(i, 'specification', e.target.value)}
              />
              <input
                className="sk-input col-span-2"
                type="number"
                min="1"
                title="Quantity"
                value={line.quantity}
                onChange={(e) => updateLine(i, 'quantity', e.target.value)}
              />
              <input
                className="sk-input col-span-2"
                type="number"
                step="0.01"
                title="Price"
                value={line.price}
                onChange={(e) => updateLine(i, 'price', e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeLine(i)}
                className="sk-icon-btn col-span-1"
                aria-label="Remove item"
                title="Remove item"
              >
                <IconTrash className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addLine} className="sk-btn-ghost mt-3">
          Add item
        </button>
      </div>

      <input type="hidden" name="lines" value={JSON.stringify(lines)} />

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={pending} className="sk-btn">
          Save
        </button>
        <Link href={lpo?.id ? `/documents/lpos/${lpo.id}` : '/documents/lpos'} className="sk-link">Cancel</Link>
      </div>
    </form>
  )
}
