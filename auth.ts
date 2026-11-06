import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'

import { verifyPassword } from '@/lib/auth/password'
import { prisma } from '@/lib/prisma'

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  pages: { signIn: '/signin' },
  // Self-hosted deployment: trust the incoming Host header (Auth.js rejects
  // unknown hosts in production unless this is set or AUTH_URL is configured).
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const parsed = credentialsSchema.safeParse(credentials)
        if (!parsed.success) {
          return null
        }

        const { email, password } = parsed.data

        const user = await prisma.users.findUnique({ where: { email } })
        if (!user || !user.active) {
          return null
        }

        const valid = await verifyPassword(password, user.password)
        if (!valid) {
          return null
        }

        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
          super: user.super,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.super = user.super
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.super = token.super as boolean
      }
      return session
    },
  },
})
