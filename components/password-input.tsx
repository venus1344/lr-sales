'use client'

import { useState } from 'react'

import { IconEye, IconEyeOff } from '@/components/icons'

export type PasswordInputProps = {
  id: string
  name: string
  className?: string
  autoComplete?: string
  required?: boolean
  minLength?: number
  defaultValue?: string
  placeholder?: string
}

/** Password input with a show/hide toggle (the field stays a password by default). */
export function PasswordInput({ id, name, className = 'sk-input', ...rest }: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <input
        {...rest}
        id={id}
        name={name}
        type={visible ? 'text' : 'password'}
        className={`${className} pr-10`}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
      >
        {visible ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
      </button>
    </div>
  )
}
