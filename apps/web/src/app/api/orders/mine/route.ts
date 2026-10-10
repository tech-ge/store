import { NextResponse } from 'next/server'
import { connectMongo, Order } from '@dd/db-mongo'
import { requireAuth } from '@dd/auth/src/require-auth'

export async function GET(req: Request) {
  try {
    const user = await requireAuth(req)
    await connectMongo()
    const orders = await Order.find({ userId: user.sub }).sort({ createdAt: -1 }).limit(100).lean()
    return NextResponse.json({ orders })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 401 })
  }
}
