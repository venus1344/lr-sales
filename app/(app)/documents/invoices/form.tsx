'use client'

import { useActionState, useState } from 'react'

import { createInvoice, updateInvoice, type InvoiceFormState } from './actions'

export type ItemOption = {
  id: string
  name: string
  specification: string | null
  unit_measure: string | null
  price: number
}

export type InvoiceLine = {
  item_id: string
  specification: string
  unit_measure: string
  quantity: string
  price: string
}

export type InvoiceFormProps = {
  invoice?: {
    id?: string
    name: string
    date: string
    currency: string
    exchange_rate: number
    labor_charge: number
    vat: number
    withholding_tax: number
    advance: number
    discount: number
    for: string
    contact: string | null
    location: string | null
    postal: string | null
    tin: string | null
    vrn: string | null
    lines: InvoiceLine[]
  }
  proformaId?: string
  items: ItemOption[]
}

const input = 'sk-input'
const label = 'block text-sm font-medium text-gray-700'

export function InvoiceForm({ invoice, proformaId, items }: InvoiceFormProps) {
  const action = invoice?.id ? updateInvoice.bind(null, invoice.id) : createInvoice

  const [state, formAction, pending] = useActionState<InvoiceFormState, FormData>(
    action,
    { error: undefined },
  )

  const [lines, setLines] = useState<InvoiceLine[]>(invoice?.lines ?? [])

  function addLine() {
    setLines((prev) => [
      ...prev,
      { item_id: '', specification: '', unit_measure: '', quantity: '1', price: '0' },
    ])
  }

  function updateLine(index: number, field: keyof InvoiceLine, value: string) {
    setLines((prev) =>
      prev.map((line, i) => {
        if (i !== index) return line

        const next = { ...line, [field]: value }

        if (field === 'item_id') {
          const item = items.find((it) => it.id === value)
          if (item) {
            next.specification = item.specification ?? ''
            next.unit_measure = item.unit_measure ?? ''
            next.price = String(item.price)
          }
        }

        return next
      }),
    )
  }

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      {proformaId ? <input type="hidden" name="proforma_id" value={proformaId} /> : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={label}>Customer</label>
          <input id="name" name="name" required defaultValue={invoice?.name} className={input} />
        </div>
        <div>
          <label htmlFor="date" className={label}>Date</label>
          <input id="date" name="date" type="date" required defaultValue={invoice?.date} className={input} />
        </div>
        <div>
          <label htmlFor="currency" className={label}>Currency</label>
          <input id="currency" name="currency" required defaultValue={invoice?.currency ?? 'TZS'} className={input} />
        </div>
        <div>
          <label htmlFor="exchange_rate" className={label}>Exchange rate</label>
          <input id="exchange_rate" name="exchange_rate" type="number" step="0.01" defaultValue={invoice?.exchange_rate ?? 1} className={input} />
        </div>
        <div>
          <label htmlFor="for" className={label}>Purpose</label>
          <input id="for" name="for" required defaultValue={invoice?.for} className={input} />
        </div>
        <div>
          <label htmlFor="contact" className={label}>Contact</label>
          <input id="contact" name="contact" defaultValue={invoice?.contact ?? ''} className={input} />
        </div>
        <div>
          <label htmlFor="location" className={label}>Location</label>
          <input id="location" name="location" defaultValue={invoice?.location ?? ''} className={input} />
        </div>
        <div>
          <label htmlFor="postal" className={label}>Postal address</label>
          <input id="postal" name="postal" defaultValue={invoice?.postal ?? ''} className={input} />
        </div>
        <div>
          <label htmlFor="tin" className={label}>TIN</label>
          <input id="tin" name="tin" maxLength={20} defaultValue={invoice?.tin ?? ''} className={input} />
        </div>
        <div>
          <label htmlFor="vrn" className={label}>VRN</label>
          <input id="vrn" name="vrn" maxLength={20} defaultValue={invoice?.vrn ?? ''} className={input} />
        </div>
        <div>
          <label htmlFor="vat" className={label}>VAT %</label>
          <input id="vat" name="vat" type="number" step="0.01" defaultValue={invoice?.vat ?? 18} className={input} />
        </div>
        <div>
          <label htmlFor="withholding_tax" className={label}>Withholding tax %</label>
          <input id="withholding_tax" name="withholding_tax" type="number" step="0.01" defaultValue={invoice?.withholding_tax ?? 2} className={input} />
        </div>
        <div>
          <label htmlFor="labor_charge" className={label}>Labour charge</label>
          <input id="labor_charge" name="labor_charge" type="number" step="0.01" defaultValue={invoice?.labor_charge ?? 0} className={input} />
        </div>
        <div>
          <label htmlFor="discount" className={label}>Discount</label>
          <input id="discount" name="discount" type="number" step="0.01" defaultValue={invoice?.discount ?? 0} className={input} />
        </div>
        <div>
          <label htmlFor="advance" className={label}>Advance</label>
          <input id="advance" name="advance" type="number" step="0.01" defaultValue={invoice?.advance ?? 0} className={input} />
        </div>
      </div>

      <div className="sk-card p-4">
        <h2 className="mb-3 font-semibold">Items</h2>
        <div className="space-y-2">
          {lines.map((line, i) => (
            <div key={i} className="grid grid-cols-12 gap-2">
              <select
                className="sk-input col-span-3"
                value={line.item_id}
                onChange={(e) => updateLine(i, 'item_id', e.target.value)}
              >
                <option value="">Item…</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
              <input
                className="sk-input col-span-4"
                placeholder="Specification"
                value={line.specification}
                onChange={(e) => updateLine(i, 'specification', e.target.value)}
              />
              <input
                className="sk-input col-span-1"
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
                className="sk-btn-ghost col-span-2"
              >
                Remove
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
        <a href="/documents/invoices" className="sk-link">Cancel</a>
      </div>
    </form>
  )
}
