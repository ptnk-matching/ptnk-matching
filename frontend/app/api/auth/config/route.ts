import { NextResponse } from 'next/server'

export async function GET() {
  const isConfigured = 
    !!process.env.GOOGLE_CLIENT_ID && 
    !!process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id_here' &&
    process.env.GOOGLE_CLIENT_SECRET !== 'your_google_client_secret_here' &&
    !!process.env.NEXTAUTH_SECRET

  return NextResponse.json({ 
    configured: isConfigured,
    hasClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    hasSecret: !!process.env.NEXTAUTH_SECRET,
  })
}

