import { NextResponse } from 'next/server'
import { connectMongo, Rate } from '@dd/db-mongo'
import { redis } from '@dd/redis-client/src/client'

const SUPPORTED = ['KES','NGN','ZAR','EGP','GHS','UGX','TZS','GBP','INR','BRL','EUR']

export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const url = `${process.env.FX_PROVIDER_URL}?base=USD&symbols=${SUPPORTED.join(',')}`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) return NextResponse.json({ error: 'provider failed' }, { status: 502 })

  const data = await res.json()
  const rates = data.rates || {}

  await connectMongo()
  await Rate.create({ base: 'USD', rates, fetchedAt: new Date(), source: 'exchangerate.host' })

  for (const [cur, val] of Object.entries(rates)) {
    await redis.set(`rate:USD:${cur}`, String(val), { ex: 3600 })
  }

  return NextResponse.json({ ok: true, refreshedAt: new Date().toISOString() })
}
