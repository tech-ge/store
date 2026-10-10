import { NextResponse } from 'next/server'
import { connectMongo, SellerFee } from '@dd/db-mongo'
import { requireAuth } from '@dd/auth/src/require-auth'

export async function GET(req: Request) {
  try {
    const payload = await requireAuth(req)
    await connectMongo()
    const fees = await SellerFee.find({ sellerId: payload.sub }).sort({ chargedAt: -1 }).limit(200).lean()
    const total = fees.reduce((s, f) => s + ((f as any).feeAmount || 0), 0)
    return NextResponse.json({ fees, totalUsd: +total.toFixed(2) })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 401 })
  }
}
