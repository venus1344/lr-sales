import { redirect } from 'next/navigation'

import { auth, signOut } from '@/auth'

export const instant = false

export default async function HomePage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/signin')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Welcome, {session.user.name}</h1>
        <p className="text-sm text-gray-500">{session.user.email}</p>
        <p className="text-xs text-gray-400">
          {session.user.super ? 'Super admin' : 'Staff account'}
        </p>
        <form
          action={async () => {
            'use server'
            await signOut({ redirectTo: '/signin' })
          }}
        >
          <button
            type="submit"
            className="sk-btn-ghost"
          >
            Sign out
          </button>
        </form>
      </div>
    </main>
  )
}
