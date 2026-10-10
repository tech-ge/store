import { NextResponse } from 'next/server'
import { connectMongo, Product } from '@dd/db-mongo'
import { requireAuth } from '@dd/auth/src/require-auth'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(req)
    const { priceUsd, stock } = await req.json()
    await connectMongo()

    const update: any = {}
    if (typeof priceUsd === 'number' && priceUsd > 0) update.priceUsd = priceUsd
    if (typeof stock === 'number' && stock >= 0) update.stock = stock

    const r = await Product.updateOne({ _id: params.id, sellerId: user.sub }, { $set: update })
    if (!r.matchedCount) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 401 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(req)
    await connectMongo()
    const r = await Product.deleteOne({ _id: params.id, sellerId: user.sub })
    if (!r.deletedCount) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 401 })
  }
}
