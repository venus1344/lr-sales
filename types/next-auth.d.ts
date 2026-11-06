import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      super: boolean
    } & DefaultSession['user']
  }

  interface User {
    super: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    super: boolean
  }
}
