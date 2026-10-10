import { NextResponse } from 'next/server'
import { connectMongo, Delivery } from '@dd/db-mongo'
import { requireAuth } from '@dd/auth/src/require-auth'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAuth(req)
    const { lat, lng } = await req.json()
    await connectMongo()
    await Delivery.updateOne(
      { _id: params.id },
      { $set: { lastLat: lat, lastLng: lng, lastPingAt: new Date() } }
    )
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 401 })
  }
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAuth(req)
    await connectMongo()
    const d: any = await Delivery.findById(params.id).lean()
    if (!d) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ lat: d.lastLat, lng: d.lastLng, at: d.lastPingAt })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 401 })
  }
}
