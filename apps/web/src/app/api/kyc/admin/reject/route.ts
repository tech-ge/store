import { NextResponse } from 'next/server'
import { connectMongo, KycRecord, User, AuditLog } from '@dd/db-mongo'
import { requireAuth } from '@dd/auth/src/require-auth'
import { requireRole } from '@dd/auth/src/require-role'
import crypto from 'crypto'

interface AuditLean { hash: string }

export async function POST(req: Request) {
  try {
    const payload = await requireAuth(req)
    requireRole(payload, 'admin')
    const { userId, reason } = await req.json()
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    await connectMongo()
    await KycRecord.updateOne({ userId }, {
      $set: { status: 'rejected', reviewedBy: payload.sub, reviewedAt: new Date(), rejectionReason: reason }
    })
    await User.updateOne({ _id: userId }, { $set: { status: 'rejected' } })

    const prev = await AuditLog.findOne().sort({ createdAt: -1 }).lean<AuditLean | null>()
    const body = JSON.stringify({ userId, action: 'reject', reason })
    const hash = crypto.createHash('sha256').update((prev?.hash || '') + body).digest('hex')

    await AuditLog.create({
      actorId: payload.sub, actorRole: 'admin', action: 'kyc_reject',
      resource: 'kyc', resourceId: userId, payload: { reason }, hash, prevHash: prev?.hash
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 401 })
  }
}
