import { NextResponse } from 'next/server'
import { connectMongo, Seller, User, AuditLog } from '@dd/db-mongo'
import { requireAuth } from '@dd/auth/src/require-auth'
import crypto from 'crypto'

interface AuditLean { hash: string }

export async function POST(req: Request) {
  try {
    const payload = await requireAuth(req)
    const body = await req.json()
    const { businessName, countryCode, payoutMethod, payoutDetails } = body

    if (!businessName || !countryCode) {
      return NextResponse.json({ error: 'businessName and countryCode required' }, { status: 400 })
    }

    await connectMongo()

    const seller = await Seller.findOneAndUpdate(
      { userId: payload.sub },
      {
        $set: {
          businessName,
          countryCode: countryCode.toUpperCase(),
          payoutMethod,
          payoutDetails
        },
        $setOnInsert: { kycStatus: 'pending', commissionRate: 0.05 }
      },
      { upsert: true, new: true }
    )

    await User.updateOne({ _id: payload.sub }, { $set: { role: 'seller' } })

    const prev = await AuditLog.findOne().sort({ createdAt: -1 }).lean<AuditLean | null>()
    const auditBody = JSON.stringify({ userId: payload.sub, businessName })
    const hash = crypto.createHash('sha256').update((prev?.hash || '') + auditBody).digest('hex')

    await AuditLog.create({
      actorId: payload.sub, actorRole: 'seller', action: 'seller_register',
      resource: 'seller', resourceId: String(seller._id),
      payload: { businessName, countryCode }, hash, prevHash: prev?.hash
    })

    return NextResponse.json({ seller })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 401 })
  }
}
