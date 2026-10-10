import { NextResponse } from 'next/server'
import { connectMongo, User } from '@dd/db-mongo'
import { validatePhoneForCountry } from '@dd/security'

export async function POST(req: Request) {
  const { phone, countryCode } = await req.json().catch(() => ({}))
  if (!phone || !countryCode) return NextResponse.json({ available: false })
  const parsed = validatePhoneForCountry(phone, countryCode)
  if (!parsed) return NextResponse.json({ available: false, reason: 'invalid_format' })
  await connectMongo()
  const exists = await User.exists({ phone: parsed.e164 })
  return NextResponse.json({ available: !exists })
}
