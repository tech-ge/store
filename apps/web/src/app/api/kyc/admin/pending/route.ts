import { NextResponse } from 'next/server'
import { connectMongo, KycRecord } from '@dd/db-mongo'
import { requireAuth } from '@dd/auth/src/require-auth'
import { requireRole } from '@dd/auth/src/require-role'

export async function GET(req: Request) {
  try {
    const payload = await requireAuth(req)
    requireRole(payload, 'admin')
    await connectMongo()
    const rows = await KycRecord.find({ status: 'pending' })
      .sort({ submittedAt: -1 }).limit(200).lean()
    return NextResponse.json({ pending: rows })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 401 })
  }
}
