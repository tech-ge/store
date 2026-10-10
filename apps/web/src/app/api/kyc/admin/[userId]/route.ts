import { NextResponse } from 'next/server'
import { connectMongo, KycRecord, User } from '@dd/db-mongo'
import { requireAuth } from '@dd/auth/src/require-auth'
import { requireRole } from '@dd/auth/src/require-role'

export async function GET(req: Request, { params }: { params: { userId: string } }) {
  try {
    const user = await requireAuth(req)
    requireRole(user, 'admin')
    await connectMongo()
    const [kyc, u] = await Promise.all([
      KycRecord.findOne({ userId: params.userId }).lean(),
      User.findById(params.userId).lean()
    ])
    if (!kyc || !u) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ kyc, user: u })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 401 })
  }
}
