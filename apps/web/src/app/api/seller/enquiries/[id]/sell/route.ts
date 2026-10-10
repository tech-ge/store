import { NextResponse } from 'next/server'
import { connectMongo, Enquiry, Product, Store, Order, SellerFee } from '@dd/db-mongo'
import { requireAuth } from '@dd/auth/src/require-auth'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(req)
    const { priceUsd, quantity } = await req.json()
    if (typeof priceUsd !== 'number' || priceUsd <= 0) return NextResponse.json({ error: 'Invalid price' }, { status: 400 })

    await connectMongo()
    const enquiry: any = await Enquiry.findById(params.id)
    if (!enquiry || String(enquiry.sellerId) !== user.sub) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (enquiry.status === 'sold') return NextResponse.json({ error: 'Already sold' }, { status: 400 })

    const product: any = await Product.findById(enquiry.productId).lean()
    if (!product) return NextResponse.json({ error: 'Product missing' }, { status: 404 })

    const store: any = await Store.findById(product.storeId).lean()

    const subtotalUsd = priceUsd * (quantity || 1)
    const insuranceUsd = +(subtotalUsd * 0.02).toFixed(2)
    const shippingUsd = store?.shippingBaseRateUsd || 5
    const totalUsd = +(subtotalUsd + insuranceUsd + shippingUsd).toFixed(2)
    const payNowUsd = +(subtotalUsd * 0.2 + insuranceUsd + shippingUsd).toFixed(2)
    const payLaterUsd = +(subtotalUsd * 0.8).toFixed(2)

    const order = await Order.create({
      userId: enquiry.buyerId,
      storeId: product.storeId,
      items: [{
        productId: product._id,
        sellerId: user.sub,
        qty: quantity || 1,
        priceUsd,
        priceLocal: priceUsd,
        currencyLocal: 'USD',
        titleSnapshot: product.title,
        imageSnapshot: product.images?.[0] || ''
      }],
      pricing: {
        subtotalUsd, subtotalLocal: subtotalUsd,
        insuranceUsd, shippingUsd,
        totalUsd, totalLocal: totalUsd,
        payNowUsd, payNowLocal: payNowUsd,
        payLaterUsd, payLaterLocal: payLaterUsd
      },
      currencyLocal: 'USD',
      fxRateAtCheckout: 1,
      fxLockedAt: new Date(),
      status: 'pending_payment'
    })

    await SellerFee.create({
      sellerId: user.sub,
      productId: product._id,
      orderId: order._id,
      feePercent: 5,
      feeAmount: +(subtotalUsd * 0.05).toFixed(2),
      currency: 'USD',
      status: 'pending',
      chargedAt: new Date()
    })

    enquiry.status = 'sold'
    enquiry.orderId = order._id
    await enquiry.save()

    return NextResponse.json({ ok: true, orderId: String(order._id) })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 401 })
  }
}
