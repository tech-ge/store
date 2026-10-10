import { NextResponse } from 'next/server'
import { connectMongo, Rating, Product } from '@dd/db-mongo'
import { requireAuth } from '@dd/auth/src/require-auth'

export async function POST(req: Request) {
  try {
    const user = await requireAuth(req)
    const body = await req.json()
    const { orderId, productId, sellerId, driverId, productScore, deliveryScore, sellerScore, comment } = body

    if (!orderId || !productId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    await connectMongo()
    await Rating.updateOne(
      { orderId, productId, userId: user.sub },
      {
        $setOnInsert: {
          orderId, productId, userId: user.sub,
          sellerId: sellerId || null,
          driverId: driverId || null,
          productScore, deliveryScore, sellerScore, comment
        }
      },
      { upsert: true }
    )

    const agg = await Rating.aggregate([
      { $match: { productId } },
      { $group: { _id: '$productId', avg: { $avg: '$productScore' }, count: { $sum: 1 } } }
    ])
    if (agg[0]) {
      await Product.updateOne(
        { _id: productId },
        { $set: { ratingAvg: agg[0].avg, ratingCount: agg[0].count } }
      )
    }
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 401 })
  }
}
