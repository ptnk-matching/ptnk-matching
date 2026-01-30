// This file is needed for Next.js API routes structure
// Actual API is handled by backend/main.py via Vercel serverless functions

export async function GET() {
  return Response.json({ message: 'API is handled by backend serverless functions' })
}

