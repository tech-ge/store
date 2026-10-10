import { NextResponse } from 'next/server'
import { connectMongo, CountryCurrency } from '@dd/db-mongo'
import { redis } from '@dd/redis-client/src/client'

export async function GET(req: Request) {
  const cc = new URL(req.url).searchParams.get('country')
    || req.headers.get('x-country')
    || 'US'

  await connectMongo()
  const record = await CountryCurrency.findOne({ countryCode: cc.toUpperCase() }).lean()
  if (!record) return NextResponse.json({ base: 'USD', currency: 'USD', symbol: '$', rate: 1 })

  const cached = await redis.get<string>(`rate:USD:${(record as any).currency}`)
  const rate = cached ? Number(cached) : 1

  return NextResponse.json({
    base: 'USD',
    currency: (record as any).currency,
    symbol: (record as any).currencySymbol,
    rate
  })
}
