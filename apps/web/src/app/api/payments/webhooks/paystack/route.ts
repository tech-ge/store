import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { connectMongo, Transaction, Wallet } from '@dd/db-mongo'
import { redis } from '@dd/redis-client/src/client'

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('x-paystack-signature')
  const expected = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY || '')
    .update(body).digest('hex')
  if (sig !== expected) return NextResponse.json({ error: 'invalid signature' }, { status: 400 })

  const event = JSON.parse(body)
  if (event.event !== 'charge.success') return NextResponse.json({ ok: true })

  await connectMongo()
  const tx = event.data
  const providerRef = String(tx.reference)
  const currency = tx.currency || 'NGN'
  const amount = tx.amount / 100
  const cached = await redis.get<string>(`rate:USD:${currency}`)
  const rate = cached ? Number(cached) : 1
  const amountUsd = +(amount / rate).toFixed(2)

  const exists = await Transaction.findOne({ providerRef })
  if (!exists) {
    const userId = tx.metadata?.userId
    if (!userId) return NextResponse.json({ ok: true })
    await Transaction.create({
      userId, type: 'deposit', method: 'card', provider: 'paystack',
      currency, amount, amountUsd, fxRate: rate, status: 'confirmed', providerRef
    })
    await Wallet.updateOne({ userId }, { $inc: { 'balances.USD': amountUsd } }, { upsert: true })
  }
  return NextResponse.json({ ok: true })
}
