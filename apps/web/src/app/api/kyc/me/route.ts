import { NextResponse } from 'next/server'
import { connectMongo, KycRecord } from '@dd/db-mongo'
import { requireAuth } from '@dd/auth/src/require-auth'

interface KycLean {
  idNumberNormalized: string
  idPhotoUrl: string
  status: string
}

export async function GET(req: Request) {
  try {
    const payload = await requireAuth(req)
    await connectMongo()
    const kyc = await KycRecord.findOne({ userId: payload.sub }).lean<KycLean | null>()
    return NextResponse.json({ kyc })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 401 })
  }
}
