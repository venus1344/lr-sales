import { AuthError } from 'next-auth'
import { redirect } from 'next/navigation'

import { signIn } from '@/auth'

export const instant = false

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-2xl font-semibold">WeLink Sales</h1>
        <p className="mb-6 text-center text-sm text-gray-500">Sign in to your account</p>

        {error === 'CredentialsSignin' && (
          <p className="mb-4 text-center text-sm text-red-600">Invalid email or password.</p>
        )}

        <form
          action={async (formData: FormData) => {
            'use server'
            try {
              await signIn(
                'credentials',
                {
                  email: formData.get('email') as string,
                  password: formData.get('password') as string,
                },
                { redirectTo: '/' },
              )
            } catch (err) {
              if (err instanceof AuthError) {
                redirect('/signin?error=CredentialsSignin')
              }
              throw err
            }
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="sk-input"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="sk-input"
            />
          </div>
          <button
            type="submit"
            className="w-full sk-btn"
          >
            Sign in
          </button>
        </form>
      </div>
    </main>
  )
}
