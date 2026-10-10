import { NextResponse } from 'next/server'
import { connectMongo, Cart } from '@dd/db-mongo'
import { requireAuth } from '@dd/auth/src/require-auth'

export async function POST(req: Request) {
  try {
    const payload = await requireAuth(req)
    const { items } = await req.json()
    if (!Array.isArray(items)) return NextResponse.json({ error: 'Invalid' }, { status: 400 })

    await connectMongo()
    let cart = await Cart.findOne({ userId: payload.sub })
    if (!cart) cart = await Cart.create({ userId: payload.sub, items: [] })

    for (const incoming of items) {
      const existing: any = (cart.items as any[]).find((i: any) => String(i.productId) === String(incoming.productId))
      if (existing) existing.qty += incoming.qty
      else (cart.items as any[]).push({
        productId: incoming.productId,
        sellerId: incoming.sellerId || null,
        qty: incoming.qty,
        priceUsd: incoming.priceUsd,
        storeId: incoming.storeId
      })
    }
    await cart.save()
    return NextResponse.json({ ok: true, items: cart.items })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 401 })
  }
}
