import { NextResponse } from 'next/server'
import { connectMongo, User, Device, AuditLog, Session, Wallet, KycRecord, Transaction } from '@dd/db-mongo'
import { requireAuth } from '@dd/auth/src/require-auth'
import { requireRole } from '@dd/auth/src/require-role'
import crypto from 'crypto'

type Target = 'user' | 'device' | 'ip'
type Action =
  | 'suspend'
  | 'reactivate'
  | 'block'
  | 'delete'
  | 'approve_withdrawal'

interface AuditLean { hash: string }

export async function POST(req: Request) {
  try {
    const payload = await requireAuth(req)
    requireRole(payload, 'admin')

    const body = await req.json()
    const { target, action, userId, fingerprint, ip, amountUsd, note } = body

    if (!target || !action) {
      return NextResponse.json({ ok: false, error: 'target and action required' }, { status: 400 })
    }

    await connectMongo()
    let effect = ''

    // ---------- USER ACTIONS ----------
    if (target === 'user') {
      if (!userId) return NextResponse.json({ ok: false, error: 'userId required' }, { status: 400 })

      const exists = await User.exists({ _id: userId })
      if (!exists) return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 })

      if (action === 'suspend') {
        await User.updateOne({ _id: userId }, { $set: { status: 'suspended' } })
        await Session.deleteMany({ userId })
        effect = 'suspended'
      } else if (action === 'reactivate') {
        await User.updateOne({ _id: userId }, { $set: { status: 'active' } })
        effect = 'reactivated'
      } else if (action === 'block') {
        await User.updateOne({ _id: userId }, { $set: { status: 'blocked' } })
        await Session.deleteMany({ userId })
        effect = 'blocked'
      } else if (action === 'delete') {
        await User.deleteOne({ _id: userId })
        await Session.deleteMany({ userId })
        await KycRecord.deleteOne({ userId })
        effect = 'deleted'
      } else if (action === 'approve_withdrawal') {
        if (typeof amountUsd !== 'number' || amountUsd <= 0) {
          return NextResponse.json({ ok: false, error: 'amountUsd required' }, { status: 400 })
        }
        const wallet: any = await Wallet.findOne({ userId })
        if (!wallet) return NextResponse.json({ ok: false, error: 'wallet not found' }, { status: 404 })
        const current = wallet.balances?.USD || 0
        if (current < amountUsd) return NextResponse.json({ ok: false, error: 'insufficient balance' }, { status: 400 })

        wallet.balances.USD = +(current - amountUsd).toFixed(2)
        await wallet.save()

        await Transaction.create({
          userId,
          type: 'withdrawal',
          method: 'internal',
          provider: 'admin_approval',
          currency: 'USD',
          amount: amountUsd,
          amountUsd,
          fxRate: 1,
          status: 'confirmed',
          providerRef: `wd_${Date.now()}`,
          metadata: { approvedBy: payload.sub, note }
        })
        effect = `withdrawal ${amountUsd} USD approved`
      } else {
        return NextResponse.json({ ok: false, error: `unknown action ${action}` }, { status: 400 })
      }
    }

    // ---------- DEVICE ACTIONS ----------
    if (target === 'device') {
      if (!fingerprint) return NextResponse.json({ ok: false, error: 'fingerprint required' }, { status: 400 })

      if (action === 'block') {
        await Device.updateOne(
          { fingerprint },
          { $set: { isBlocked: true, blockReason: note || 'admin block', blockedBy: payload.sub, blockedAt: new Date() } },
          { upsert: true }
        )
        effect = 'device blocked'
      } else if (action === 'reactivate') {
        await Device.updateOne(
          { fingerprint },
          { $set: { isBlocked: false }, $unset: { blockReason: '', blockedAt: '', blockedBy: '' } },
          { upsert: true }
        )
        effect = 'device unblocked'
      } else if (action === 'delete') {
        await Device.deleteOne({ fingerprint })
        effect = 'device deleted'
      } else {
        return NextResponse.json({ ok: false, error: `unknown action ${action}` }, { status: 400 })
      }
    }

    // ---------- IP ACTIONS ----------
    if (target === 'ip') {
      if (!ip) return NextResponse.json({ ok: false, error: 'ip required' }, { status: 400 })

      if (action === 'block') {
        await Device.updateMany(
          { ip },
          { $set: { isBlocked: true, blockReason: note || 'admin ip block', blockedBy: payload.sub, blockedAt: new Date() } }
        )
        effect = `${ip} blocked`
      } else if (action === 'reactivate') {
        await Device.updateMany(
          { ip },
          { $set: { isBlocked: false }, $unset: { blockReason: '', blockedAt: '', blockedBy: '' } }
        )
        effect = `${ip} unblocked`
      } else if (action === 'delete') {
        await Device.deleteMany({ ip })
        effect = `${ip} deleted`
      } else {
        return NextResponse.json({ ok: false, error: `unknown action ${action}` }, { status: 400 })
      }
    }

    // audit
    const prev = await AuditLog.findOne().sort({ createdAt: -1 }).lean<AuditLean | null>()
    const auditBody = JSON.stringify({ target, action, userId, fingerprint, ip, amountUsd, note })
    const hash = crypto.createHash('sha256').update((prev?.hash || '') + auditBody).digest('hex')

    await AuditLog.create({
      actorId: payload.sub,
      actorRole: 'admin',
      action: `${target}_${action}`,
      resource: target,
      resourceId: userId || fingerprint || ip,
      payload: { amountUsd, note },
      hash,
      prevHash: prev?.hash
    })

    return NextResponse.json({ ok: true, effect })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: e.status || 500 })
  }
}
