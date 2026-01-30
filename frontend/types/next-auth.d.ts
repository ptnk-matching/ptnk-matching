import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: 'student' | 'professor'
    }
    accessToken?: string
  }

  interface User {
    id: string
    role?: 'student' | 'professor'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    accessToken?: string
    role?: 'student' | 'professor'
  }
}

