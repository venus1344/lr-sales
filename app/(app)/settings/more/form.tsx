'use client'

import { useActionState } from 'react'
import { useFormToast } from '@/components/toast'

import { createSetting, updateSetting, type SettingFormState } from './actions'

export function SettingForm() {
  const [state, formAction, pending] = useActionState<SettingFormState, FormData>(createSetting, {
    error: undefined,
  })
  useFormToast(state)

  return (
    <form action={formAction} className="space-y-4">
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
        <input id="name" name="name" required className="sk-input" placeholder="e.g. Tax Rate" />
      </div>

      <div>
        <label htmlFor="value" className="block text-sm font-medium text-gray-700">Value</label>
        <input id="value" name="value" type="number" step="any" required className="sk-input" />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={pending} className="sk-btn disabled:opacity-50">Save setting</button>
        <a href="/settings/more" className="text-sm text-gray-500 hover:text-gray-700">Cancel</a>
      </div>
    </form>
  )
}

export function SettingEditForm({
  setting,
}: {
  setting: { id: string; name: string; value: string }
}) {
  const action = updateSetting.bind(null, setting.id)
  const [state, formAction, pending] = useActionState<SettingFormState, FormData>(action, {
    error: undefined,
  })
  useFormToast(state)

  return (
    <form action={formAction} className="space-y-4">
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div>
        <p className="text-sm text-gray-500">Name</p>
        <p className="font-medium capitalize">{setting.name.replace(/_/g, ' ')}</p>
      </div>

      <div>
        <label htmlFor="value" className="block text-sm font-medium text-gray-700">Value</label>
        <input id="value" name="value" type="number" step="any" required defaultValue={setting.value} className="sk-input" />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={pending} className="sk-btn disabled:opacity-50">Save changes</button>
        <a href="/settings/more" className="text-sm text-gray-500 hover:text-gray-700">Cancel</a>
      </div>
    </form>
  )
}
