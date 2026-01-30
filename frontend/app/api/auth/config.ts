import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

// Check if Google OAuth is configured
const isGoogleConfigured = 
  process.env.GOOGLE_CLIENT_ID && 
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id_here' &&
  process.env.GOOGLE_CLIENT_SECRET !== 'your_google_client_secret_here'

export const authOptions: NextAuthOptions = {
  providers: isGoogleConfigured
    ? [
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
      ]
    : [],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (account) {
        token.accessToken = account.access_token
        token.id = profile?.sub
        
        // Role will be set from client-side after login
        // We'll read it from localStorage in the session callback
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token and user id from a provider.
      if (session.user) {
        session.user.id = token.id as string
        session.accessToken = token.accessToken as string
        
        // Get role from token (set by client-side code)
        if (token.role) {
          (session.user as any).role = token.role
        }
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  // Ensure correct URL in production
  ...(process.env.NEXTAUTH_URL && {
    url: process.env.NEXTAUTH_URL,
  }),
}

// Export configuration status
export const isAuthConfigured = isGoogleConfigured && !!process.env.NEXTAUTH_SECRET

