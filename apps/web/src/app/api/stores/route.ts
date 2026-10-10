import { NextResponse } from 'next/server'
import { connectMongo, Store } from '@dd/db-mongo'

export async function GET() {
  await connectMongo()
  const rows = await Store.find({ isActive: true }).lean()
  return NextResponse.json({
    stores: rows.map((s: any) => ({
      countryCode: s.countryCode,
      countryName: s.countryName,
      currency: s.currency
    }))
  })
}

export const dynamic = 'force-dynamic'
