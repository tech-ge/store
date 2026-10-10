import { NextResponse } from 'next/server'
import { connectMongo, Order, SellerFee } from '@dd/db-mongo'
import { requireAuth } from '@dd/auth/src/require-auth'

export async function POST(req: Request, { params }: { params: { orderId: string } }) {
  try {
    const user = await requireAuth(req)
    await connectMongo()

    const order: any = await Order.findById(params.orderId)
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    let touched = 0
    for (const item of order.items) {
      if (String(item.sellerId) === user.sub && item.sellerStatus !== 'completed') {
        item.sellerStatus = 'completed'
        item.sellerCompletedAt = new Date()
        touched++

        // charge 5% fee once per completed item
        await SellerFee.updateOne(
          { orderId: order._id, productId: item.productId, sellerId: user.sub },
          {
            $setOnInsert: {
              feePercent: 5,
              feeAmount: +(item.priceUsd * item.qty * 0.05).toFixed(2),
              currency: 'USD',
              status: 'pending',
              chargedAt: new Date()
            }
          },
          { upsert: true }
        )
      }
    }

    if (!touched) return NextResponse.json({ error: 'Nothing to complete' }, { status: 400 })

    // if all items across all sellers are completed, order moves to completed
    const allDone = order.items.every((it: any) => it.sellerStatus === 'completed')
    if (allDone && order.status !== 'completed') {
      order.status = 'completed'
    } else if (order.status === 'paid_20') {
      order.status = 'seller_confirmed'
    }

    await order.save()
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 401 })
  }
}
