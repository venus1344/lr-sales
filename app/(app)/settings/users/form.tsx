'use client'

import { useActionState } from 'react'
import { useFormToast } from '@/components/toast'

import { createUser, updateUser, type UserFormState } from './actions'

export type RoleOption = { id: string; name: string }

export type UserFormProps = {
  roles: RoleOption[]
  user?: {
    id: string
    name: string
    email: string
    roleIds: string[]
  }
}

export function UserForm({ roles, user }: UserFormProps) {
  const action = user ? updateUser.bind(null, user.id) : createUser

  const [state, formAction, pending] = useActionState<UserFormState, FormData>(action, {
    error: undefined,
  })
  useFormToast(state)

  return (
    <form action={formAction} className="space-y-4">
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
        <input id="name" name="name" required maxLength={300} defaultValue={user?.name} className="sk-input" />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail</label>
        <input id="email" name="email" type="email" required maxLength={300} defaultValue={user?.email} className="sk-input" />
      </div>

      {user ? (
        <>
          <p className="text-sm text-gray-500">
            Set a new password only if you need to reset this account. Leave blank to keep the current password.
          </p>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">New password</label>
            <input id="password" name="password" type="password" minLength={8} className="sk-input" placeholder="Leave blank to keep current" />
          </div>
          <div>
            <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
              Confirm new password
            </label>
            <input id="password_confirmation" name="password_confirmation" type="password" minLength={8} className="sk-input" placeholder="Leave blank to keep current" />
          </div>
        </>
      ) : (
        <>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input id="password" name="password" type="password" required minLength={8} className="sk-input" />
          </div>
          <div>
            <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
              Confirm password
            </label>
            <input id="password_confirmation" name="password_confirmation" type="password" required minLength={8} className="sk-input" />
          </div>
        </>
      )}

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-gray-700">Roles</legend>
        {roles.length === 0 ? (
          <p className="text-sm text-gray-400">No roles yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {roles.map((role) => (
              <label key={role.id} className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  name="roles"
                  value={role.id}
                  defaultChecked={user ? user.roleIds.includes(role.id) : false}
                  className="rounded border-gray-300"
                />
                {role.name}
              </label>
            ))}
          </div>
        )}
      </fieldset>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={pending} className="sk-btn disabled:opacity-50">Save</button>
        <a href="/settings/users" className="text-sm text-gray-500 hover:text-gray-700">Cancel</a>
      </div>
    </form>
  )
}
