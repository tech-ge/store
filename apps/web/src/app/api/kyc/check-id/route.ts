import { NextResponse } from 'next/server'
import { connectMongo, KycRecord } from '@dd/db-mongo'
import { hashIdNumber, normalizeIdNumber } from '@dd/security'

export async function POST(req: Request) {
  const { idNumber, countryCode } = await req.json().catch(() => ({}))
  if (!idNumber || !countryCode) return NextResponse.json({ available: false })
  await connectMongo()
  const hash = hashIdNumber(normalizeIdNumber(idNumber), countryCode)
  const exists = await KycRecord.exists({ idNumberHash: hash, countryCode })
  return NextResponse.json({ available: !exists })
}
