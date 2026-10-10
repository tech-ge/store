import { NextResponse } from 'next/server'
import { connectMongo, Device, User, AuditLog } from '@dd/db-mongo'
import { requireAuth } from '@dd/auth/src/require-auth'
import { requireRole } from '@dd/auth/src/require-role'
import crypto from 'crypto'

interface AuditLean { hash: string }

export async function POST(req: Request) {
  try {
    const payload = await requireAuth(req)
    requireRole(payload, 'admin')

    const { deviceFingerprint, userId, reason } = await req.json()
    if (!deviceFingerprint && !userId) {
      return NextResponse.json({ error: 'deviceFingerprint or userId required' }, { status: 400 })
    }

    await connectMongo()

    if (deviceFingerprint) {
      await Device.updateOne(
        { fingerprint: deviceFingerprint },
        { $set: { isBlocked: true, blockReason: reason || 'admin block', blockedBy: payload.sub, blockedAt: new Date() } },
        { upsert: true }
      )
    }
    if (userId) {
      await User.updateOne({ _id: userId }, { $set: { status: 'blocked' } })
    }

    const prev = await AuditLog.findOne().sort({ createdAt: -1 }).lean<AuditLean | null>()
    const body = JSON.stringify({ deviceFingerprint, userId, reason })
    const hash = crypto.createHash('sha256').update((prev?.hash || '') + body).digest('hex')

    await AuditLog.create({
      actorId: payload.sub, actorRole: 'admin', action: 'block',
      resource: deviceFingerprint ? 'device' : 'user',
      resourceId: deviceFingerprint || userId,
      payload: { reason }, hash, prevHash: prev?.hash
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 401 })
  }
}
