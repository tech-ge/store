import { NextResponse } from 'next/server'
import { connectMongo, Seller, User } from '@dd/db-mongo'
import { requireAuth } from '@dd/auth/src/require-auth'

export async function POST(req: Request) {
  try {
    const payload = await requireAuth(req)
    const { businessName, countryCode, payoutMethod, payoutDetails } = await req.json()
    if (!businessName || !countryCode) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    await connectMongo()
    const seller = await Seller.findOneAndUpdate(
      { userId: payload.sub },
      {
        $set: { businessName, countryCode, payoutMethod, payoutDetails },
        $setOnInsert: { kycStatus: 'pending', commissionRate: 0.05 }
      },
      { upsert: true, new: true }
    )
    await User.updateOne({ _id: payload.sub }, { $set: { role: 'seller' } })
    return NextResponse.json({ seller })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 401 })
  }
}
