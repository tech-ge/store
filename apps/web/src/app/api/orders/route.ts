import { NextResponse } from 'next/server'
import { connectMongo, Order, Product, Store, ShippingQuote } from '@dd/db-mongo'
import { requireAuth } from '@dd/auth/src/require-auth'
import { calculateShippingFee } from '@dd/shipping/src/fee'
import { CheckoutSchema } from '@dd/validation/src/order'

export async function POST(req: Request) {
  try {
    const payload = await requireAuth(req)
    const parsed = CheckoutSchema.safeParse(await req.json())
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

    const { items, destination } = parsed.data
    await connectMongo()

    let subtotalUsd = 0
    const orderItems: any[] = []
    let storeId: any = null
    const origin = { lat: 0, lng: 0 }

    for (const it of items) {
      const product: any = await Product.findById(it.productId).lean()
      if (!product) return NextResponse.json({ error: `Product not found: ${it.productId}` }, { status: 400 })
      storeId = product.storeId
      subtotalUsd += product.priceUsd * it.qty
      orderItems.push({
        productId: product._id,
        sellerId: product.sellerId || null,
        qty: it.qty,
        priceUsd: product.priceUsd,
        priceLocal: product.priceUsd,
        currencyLocal: 'USD',
        titleSnapshot: product.title,
        imageSnapshot: product.images?.[0] || ''
      })
    }

    const store: any = storeId ? await Store.findById(storeId).lean() : null
    const shipping = calculateShippingFee({
      origin,
      destination,
      weightKg: 1,
      countryBaseRateUsd: store?.shippingBaseRateUsd || 5
    })

    const quote = await ShippingQuote.create({
      origin, destination,
      distanceKm: shipping.distanceKm,
      estTimeHours: shipping.estTimeHours,
      weightKg: shipping.weightKg,
      countryFactor: shipping.countryFactor,
      finalFeeUsd: shipping.finalFeeUsd,
      currency: 'USD'
    })

    const insuranceUsd = +(subtotalUsd * 0.02).toFixed(2)
    const shippingUsd = shipping.finalFeeUsd
    const totalUsd = +(subtotalUsd + insuranceUsd + shippingUsd).toFixed(2)
    const payNowUsd = +(subtotalUsd * 0.2 + insuranceUsd + shippingUsd).toFixed(2)
    const payLaterUsd = +(subtotalUsd * 0.8).toFixed(2)

    const order = await Order.create({
      userId: payload.sub,
      storeId,
      items: orderItems,
      pricing: {
        subtotalUsd, subtotalLocal: subtotalUsd,
        insuranceUsd, shippingUsd, totalUsd, totalLocal: totalUsd,
        payNowUsd, payNowLocal: payNowUsd,
        payLaterUsd, payLaterLocal: payLaterUsd
      },
      currencyLocal: 'USD',
      fxRateAtCheckout: 1,
      fxLockedAt: new Date(),
      status: 'pending_payment',
      shippingQuoteId: quote._id
    })

    return NextResponse.json({ orderId: order._id, payNowUsd, payLaterUsd, totalUsd })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 401 })
  }
}
