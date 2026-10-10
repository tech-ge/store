import { NextResponse } from 'next/server'
import { connectMongo, CountryCurrency } from '@dd/db-mongo'
import { redis } from '@dd/redis-client/src/client'

export async function POST(req: Request) {
  const { amountUsd, countryCode } = await req.json()
  if (typeof amountUsd !== 'number' || !countryCode) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }
  await connectMongo()
  const record = await CountryCurrency.findOne({ countryCode: countryCode.toUpperCase() }).lean()
  if (!record) return NextResponse.json({ base: 'USD', currency: 'USD', rate: 1, amountLocal: amountUsd })

  const cached = await redis.get<string>(`rate:USD:${(record as any).currency}`)
  const rate = cached ? Number(cached) : 1
  return NextResponse.json({
    base: 'USD',
    currency: (record as any).currency,
    symbol: (record as any).currencySymbol,
    rate,
    amountLocal: +(amountUsd * rate).toFixed(2)
  })
}
