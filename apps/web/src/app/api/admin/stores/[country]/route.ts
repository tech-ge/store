import { NextResponse } from 'next/server'
import { connectMongo, Store, AuditLog } from '@dd/db-mongo'
import { requireAuth } from '@dd/auth/src/require-auth'
import { requireRole } from '@dd/auth/src/require-role'
import crypto from 'crypto'

interface AuditLean { hash: string }

export async function PATCH(req: Request, { params }: { params: { country: string } }) {
  try {
    const payload = await requireAuth(req)
    requireRole(payload, 'admin')

    const body = await req.json()
    const { shippingBaseRateUsd, isActive } = body

    await connectMongo()
    const update: any = {}
    if (typeof shippingBaseRateUsd === 'number') update.shippingBaseRateUsd = shippingBaseRateUsd
    if (typeof isActive === 'boolean') update.isActive = isActive

    const store = await Store.findOneAndUpdate(
      { countryCode: params.country.toUpperCase() },
      { $set: update },
      { new: true }
    )
    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 })

    const prev = await AuditLog.findOne().sort({ createdAt: -1 }).lean<AuditLean | null>()
    const auditBody = JSON.stringify({ country: params.country, update })
    const hash = crypto.createHash('sha256').update((prev?.hash || '') + auditBody).digest('hex')

    await AuditLog.create({
      actorId: payload.sub, actorRole: 'admin', action: 'update_store',
      resource: 'store', resourceId: params.country,
      payload: update, hash, prevHash: prev?.hash
    })

    return NextResponse.json({ store })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 401 })
  }
}
