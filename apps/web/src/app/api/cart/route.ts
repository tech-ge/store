import { NextResponse } from 'next/server'
import { connectMongo, Cart } from '@dd/db-mongo'
import { requireAuth } from '@dd/auth/src/require-auth'

export async function GET(req: Request) {
  try {
    const user = await requireAuth(req)
    await connectMongo()
    const cart = await Cart.findOne({ userId: user.sub }).lean()
    return NextResponse.json({ cart: cart || { userId: user.sub, items: [] } })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 401 })
  }
}

export async function PUT(req: Request) {
  try {
    const user = await requireAuth(req)
    const { items } = await req.json()
    if (!Array.isArray(items)) return NextResponse.json({ error: 'Invalid' }, { status: 400 })
    await connectMongo()
    const cart = await Cart.findOneAndUpdate(
      { userId: user.sub },
      { $set: { items } },
      { upsert: true, new: true }
    )
    return NextResponse.json({ cart })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 401 })
  }
}
