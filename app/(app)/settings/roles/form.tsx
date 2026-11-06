'use client'

import { useActionState, useRef, useState } from 'react'
import { useFormToast } from '@/components/toast'

import { createRole, updateRole, type RoleFormState } from './actions'

export type AbilityOption = { id: string; label: string }

export type RoleFormProps = {
  abilities: AbilityOption[]
  role?: {
    id: string
    name: string
    description: string
    abilityIds: string[]
  }
}

export function RoleForm({ abilities, role }: RoleFormProps) {
  const action = role ? updateRole.bind(null, role.id) : createRole

  const [state, formAction, pending] = useActionState<RoleFormState, FormData>(action, {
    error: undefined,
  })
  useFormToast(state)

  const formRef = useRef<HTMLFormElement>(null)
  const [allChecked, setAllChecked] = useState(false)

  function toggleAll() {
    const next = !allChecked
    setAllChecked(next)
    formRef.current?.querySelectorAll<HTMLInputElement>('input[name="abilities"]').forEach((box) => {
      box.checked = next
    })
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
        <input id="name" name="name" required maxLength={200} defaultValue={role?.name} className="sk-input" />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          id="description"
          name="description"
          required
          maxLength={500}
          rows={2}
          defaultValue={role?.description}
          className="sk-input"
        />
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-gray-700">Abilities</legend>
        {abilities.length === 0 ? (
          <p className="text-sm text-gray-400">No abilities seeded.</p>
        ) : (
          <>
            <label className="mb-2 flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={toggleAll}
                className="rounded border-gray-300"
              />
              {allChecked ? 'Uncheck all' : 'Check all'}
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {abilities.map((ability) => (
                <label key={ability.id} className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    name="abilities"
                    value={ability.id}
                    defaultChecked={role ? role.abilityIds.includes(ability.id) : false}
                    className="rounded border-gray-300"
                  />
                  {ability.label}
                </label>
              ))}
            </div>
          </>
        )}
      </fieldset>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={pending} className="sk-btn disabled:opacity-50">Save</button>
        <a href="/settings/roles" className="text-sm text-gray-500 hover:text-gray-700">Cancel</a>
      </div>
    </form>
  )
}
