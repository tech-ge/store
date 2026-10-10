import { NextResponse } from 'next/server'
import { connectMongo, Order, Receipt } from '@dd/db-mongo'
import { requireAuth } from '@dd/auth/src/require-auth'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(req)
    await connectMongo()
    const order = await Order.findById(params.id).lean()
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (String((order as any).userId) !== user.sub && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const receipt = await Receipt.findOne({ orderId: (order as any)._id }).lean()
    return NextResponse.json({ receipt })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 401 })
  }
}
