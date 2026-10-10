import { NextResponse } from 'next/server'
import { connectMongo, Store } from '@dd/db-mongo'

export const dynamic = 'force-dynamic'

export async function GET() {
  await connectMongo()
  const rows = await Store.find({ isActive: true }).sort({ countryName: 1 }).lean()
  return NextResponse.json({
    stores: rows.map((s: any) => ({
      countryCode: s.countryCode,
      countryName: s.countryName,
      storeName: s.storeName || `${s.countryName} Store`,
      currency: s.currency,
      currencySymbol: s.currencySymbol
    }))
  })
}
