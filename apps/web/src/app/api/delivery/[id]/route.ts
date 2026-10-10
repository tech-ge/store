import { NextResponse } from 'next/server'
import { connectMongo, Delivery } from '@dd/db-mongo'
import { requireAuth } from '@dd/auth/src/require-auth'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAuth(req)
    await connectMongo()
    const delivery = await Delivery.findById(params.id).lean()
    if (!delivery) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ delivery })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 401 })
  }
}
