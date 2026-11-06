'use client'

import Link from 'next/link'
import { useActionState, useState } from 'react'
import { useFormToast } from '@/components/toast'

import { Combobox, type ComboboxOption } from '@/components/combobox'
import { IconTrash } from '@/components/icons'
import { createProforma, updateProforma, type ProformaFormState } from './actions'

export type ItemOption = {
  id: string
  name: string
  specification: string | null
  unit_measure: string | null
  price: number
}

export type ProformaLine = {
  item_id: string
  specification: string
  unit_measure: string
  quantity: string
  price: string
}

export type ProformaFormProps = {
  proforma?: {
    id: string
    name: string
    date: string
    currency: string
    exchange_rate: number
    labor_charge: number
    vat: number
    withholding_tax: number
    advance: number
    for: string
    contact: string | null
    location: string | null
    postal: string | null
    tin: string | null
    vrn: string | null
    lines: ProformaLine[]
  }
  items: ItemOption[]
}

type ItemData = {
  specification: string | null
  unit_measure: string | null
  price: number | null
}

type CustomerData = {
  location: string | null
  contact: string | null
  postal: string | null
  tin: string | null
  vrn: string | null
}

const input = 'sk-input'
const label = 'block text-sm font-medium text-gray-700'

export function ProformaForm({ proforma, items }: ProformaFormProps) {
  const action = proforma ? updateProforma.bind(null, proforma.id) : createProforma

  const [state, formAction, pending] = useActionState<ProformaFormState, FormData>(
    action,
    { error: undefined },
  )
  useFormToast(state)

  const [lines, setLines] = useState<ProformaLine[]>(proforma?.lines ?? [])
  const [labels, setLabels] = useState<Record<string, string>>(() =>
    Object.fromEntries(items.map((item) => [item.id, item.name])),
  )
  const [customer, setCustomer] = useState({
    name: proforma?.name ?? '',
    contact: proforma?.contact ?? '',
    location: proforma?.location ?? '',
    postal: proforma?.postal ?? '',
    tin: proforma?.tin ?? '',
    vrn: proforma?.vrn ?? '',
  })

  function addLine() {
    setLines((prev) => [
      ...prev,
      { item_id: '', specification: '', unit_measure: '', quantity: '1', price: '0' },
    ])
  }

  function updateLine(index: number, field: keyof ProformaLine, value: string) {
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
          unit_measure: data?.unit_measure ?? line.unit_measure,
          price: data?.price != null ? String(data.price) : line.price,
        }
      }),
    )
  }

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index))
  }

  function selectCustomer(option: ComboboxOption) {
    const data = option.data as CustomerData | undefined
    setCustomer((prev) => ({
      ...prev,
      name: option.label,
      contact: data?.contact ?? prev.contact,
      location: data?.location ?? prev.location,
      postal: data?.postal ?? prev.postal,
      tin: data?.tin ?? prev.tin,
      vrn: data?.vrn ?? prev.vrn,
    }))
  }

  function setCustomerField(field: 'contact' | 'location' | 'postal' | 'tin' | 'vrn', value: string) {
    setCustomer((prev) => ({ ...prev, [field]: value }))
  }

  const labelFor = (id: string) => labels[id] ?? ''

  return (
    <form action={formAction} className="space-y-4">
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={label}>Customer</label>
          <Combobox
            id="name"
            name="name"
            value={customer.name}
            label={customer.name}
            placeholder="Search customers…"
            searchUrl="/api/search/customers"
            createHref="/settings/customers/new"
            createLabel="Create customer"
            onChange={selectCustomer}
          />
        </div>
        <div>
          <label htmlFor="date" className={label}>Date</label>
          <input id="date" name="date" type="date" required defaultValue={proforma?.date} className={input} />
        </div>
        <div>
          <label htmlFor="currency" className={label}>Currency</label>
          <input id="currency" name="currency" required defaultValue={proforma?.currency ?? 'TZS'} className={input} />
        </div>
        <div>
          <label htmlFor="exchange_rate" className={label}>Exchange rate</label>
          <input id="exchange_rate" name="exchange_rate" type="number" step="0.01" defaultValue={proforma?.exchange_rate ?? 1} className={input} />
        </div>
        <div>
          <label htmlFor="for" className={label}>Purpose</label>
          <input id="for" name="for" required defaultValue={proforma?.for} className={input} />
        </div>
        <div>
          <label htmlFor="contact" className={label}>Contact</label>
          <input id="contact" name="contact" value={customer.contact} onChange={(e) => setCustomerField('contact', e.target.value)} className={input} />
        </div>
        <div>
          <label htmlFor="location" className={label}>Location</label>
          <input id="location" name="location" value={customer.location} onChange={(e) => setCustomerField('location', e.target.value)} className={input} />
        </div>
        <div>
          <label htmlFor="postal" className={label}>Postal address</label>
          <input id="postal" name="postal" value={customer.postal} onChange={(e) => setCustomerField('postal', e.target.value)} className={input} />
        </div>
        <div>
          <label htmlFor="tin" className={label}>TIN</label>
          <input id="tin" name="tin" maxLength={20} value={customer.tin} onChange={(e) => setCustomerField('tin', e.target.value)} className={input} />
        </div>
        <div>
          <label htmlFor="vrn" className={label}>VRN</label>
          <input id="vrn" name="vrn" maxLength={20} value={customer.vrn} onChange={(e) => setCustomerField('vrn', e.target.value)} className={input} />
        </div>
        <div>
          <label htmlFor="vat" className={label}>VAT %</label>
          <input id="vat" name="vat" type="number" step="0.01" defaultValue={proforma?.vat ?? 18} className={input} />
        </div>
        <div>
          <label htmlFor="withholding_tax" className={label}>Withholding tax %</label>
          <input id="withholding_tax" name="withholding_tax" type="number" step="0.01" defaultValue={proforma?.withholding_tax ?? 2} className={input} />
        </div>
        <div>
          <label htmlFor="labor_charge" className={label}>Labour charge</label>
          <input id="labor_charge" name="labor_charge" type="number" step="0.01" defaultValue={proforma?.labor_charge ?? 0} className={input} />
        </div>
        <div>
          <label htmlFor="advance" className={label}>Advance</label>
          <input id="advance" name="advance" type="number" step="0.01" defaultValue={proforma?.advance ?? 0} className={input} />
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
        <Link href={proforma ? `/documents/proformas/${proforma.id}` : '/documents/proformas'} className="sk-link">Cancel</Link>
      </div>
    </form>
  )
}
