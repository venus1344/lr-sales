'use client'

import { useActionState } from 'react'

import { changePassword, updateProfile, type ProfileFormState } from './actions'

export type ProfileFormProps = {
  user: {
    name: string
    email: string
    location: string
    skills: string
    notes: string
    education: string
  }
}

function Feedback({ state }: { state: ProfileFormState }) {
  if (state.error) {
    return <p className="text-sm text-red-600">{state.error}</p>
  }
  if (state.success) {
    return <p className="text-sm text-green-600">{state.success}</p>
  }
  return null
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [state, formAction, pending] = useActionState<ProfileFormState, FormData>(updateProfile, {
    error: undefined,
  })

  return (
    <form action={formAction} className="space-y-4">
      <Feedback state={state} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input id="name" name="name" required maxLength={300} defaultValue={user.name} className="sk-input" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail</label>
          <input id="email" name="email" type="email" required maxLength={300} defaultValue={user.email} className="sk-input" />
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
          <input id="location" name="location" defaultValue={user.location} className="sk-input" />
        </div>
        <div>
          <label htmlFor="skills" className="block text-sm font-medium text-gray-700">Skills</label>
          <input id="skills" name="skills" defaultValue={user.skills} className="sk-input" />
        </div>
      </div>

      <div>
        <label htmlFor="education" className="block text-sm font-medium text-gray-700">Education</label>
        <textarea id="education" name="education" rows={2} defaultValue={user.education} className="sk-input" />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea id="notes" name="notes" rows={2} defaultValue={user.notes} className="sk-input" />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={pending} className="sk-btn disabled:opacity-50">Save profile</button>
      </div>
    </form>
  )
}

export function PasswordForm() {
  const [state, formAction, pending] = useActionState<ProfileFormState, FormData>(changePassword, {
    error: undefined,
  })

  return (
    <form action={formAction} className="space-y-4">
      <Feedback state={state} />

      <div>
        <label htmlFor="old_password" className="block text-sm font-medium text-gray-700">Current password</label>
        <input id="old_password" name="old_password" type="password" required className="sk-input" />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">New password</label>
        <input id="password" name="password" type="password" required minLength={8} className="sk-input" />
      </div>
      <div>
        <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">Confirm new password</label>
        <input id="password_confirmation" name="password_confirmation" type="password" required minLength={8} className="sk-input" />
      </div>

      <p className="text-xs text-gray-500">Changing your password signs you out of this session.</p>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={pending} className="sk-btn disabled:opacity-50">Change password</button>
      </div>
    </form>
  )
}
