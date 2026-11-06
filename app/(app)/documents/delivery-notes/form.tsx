'use client'

import { useActionState, useState } from 'react'

import { createDeliveryNote, updateDeliveryNote, type DeliveryNoteFormState } from './actions'

export type ItemOption = {
  id: string
  name: string
  specification: string | null
  unit_measure: string | null
}

export type DNoteLine = {
  item_id: string
  description: string
  unit_measure: string
  quantity: string
  serial_no: string
}

export type DeliveryNoteFormProps = {
  dnote?: {
    id?: string
    date: string
    name: string
    postal: string | null
    location: string | null
    contact: string | null
    tin: string | null
    vrn: string | null
    lines: DNoteLine[]
  }
  items: ItemOption[]
}

const input = 'sk-input'
const label = 'block text-sm font-medium text-gray-700'

export function DeliveryNoteForm({ dnote, items }: DeliveryNoteFormProps) {
  const action = dnote?.id ? updateDeliveryNote.bind(null, dnote.id) : createDeliveryNote

  const [state, formAction, pending] = useActionState<DeliveryNoteFormState, FormData>(
    action,
    { error: undefined },
  )

  const [lines, setLines] = useState<DNoteLine[]>(dnote?.lines ?? [])

  function addLine() {
    setLines((prev) => [
      ...prev,
      { item_id: '', description: '', unit_measure: '', quantity: '1', serial_no: '' },
    ])
  }

  function updateLine(index: number, field: keyof DNoteLine, value: string) {
    setLines((prev) =>
      prev.map((line, i) => {
        if (i !== index) return line

        const next = { ...line, [field]: value }

        if (field === 'item_id') {
          const item = items.find((it) => it.id === value)
          if (item) {
            next.description = item.specification ?? ''
            next.unit_measure = item.unit_measure ?? ''
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="date" className={label}>Date</label>
          <input id="date" name="date" type="date" required defaultValue={dnote?.date} className={input} />
        </div>
        <div>
          <label htmlFor="name" className={label}>Customer</label>
          <input id="name" name="name" required defaultValue={dnote?.name} className={input} />
        </div>
        <div>
          <label htmlFor="contact" className={label}>Contact</label>
          <input id="contact" name="contact" defaultValue={dnote?.contact ?? ''} className={input} />
        </div>
        <div>
          <label htmlFor="location" className={label}>Location</label>
          <input id="location" name="location" defaultValue={dnote?.location ?? ''} className={input} />
        </div>
        <div>
          <label htmlFor="postal" className={label}>Postal address</label>
          <input id="postal" name="postal" defaultValue={dnote?.postal ?? ''} className={input} />
        </div>
        <div>
          <label htmlFor="tin" className={label}>TIN</label>
          <input id="tin" name="tin" maxLength={20} defaultValue={dnote?.tin ?? ''} className={input} />
        </div>
        <div>
          <label htmlFor="vrn" className={label}>VRN</label>
          <input id="vrn" name="vrn" maxLength={20} defaultValue={dnote?.vrn ?? ''} className={input} />
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
                placeholder="Description"
                value={line.description}
                onChange={(e) => updateLine(i, 'description', e.target.value)}
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
                placeholder="Serial no"
                value={line.serial_no}
                onChange={(e) => updateLine(i, 'serial_no', e.target.value)}
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
        <a href="/documents/delivery-notes" className="sk-link">Cancel</a>
      </div>
    </form>
  )
}
