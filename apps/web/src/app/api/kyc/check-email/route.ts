import { NextResponse } from 'next/server'
import { connectMongo, User } from '@dd/db-mongo'

export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({}))
  if (!email) return NextResponse.json({ available: false })
  await connectMongo()
  const exists = await User.exists({ emailNormalized: email.toLowerCase().trim() })
  return NextResponse.json({ available: !exists })
}
