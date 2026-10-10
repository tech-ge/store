import { NextResponse } from 'next/server'
import { connectMongo, Transaction, Wallet } from '@dd/db-mongo'
import { redis } from '@dd/redis-client/src/client'

export async function POST(req: Request) {
  const sig = req.headers.get('verif-hash')
  if (sig !== process.env.FLUTTERWAVE_WEBHOOK_HASH) {
    return NextResponse.json({ error: 'invalid signature' }, { status: 400 })
  }
  const body = await req.json()
  if (body.status !== 'successful' || body.event !== 'charge.completed') {
    return NextResponse.json({ ok: true })
  }
  await connectMongo()
  const tx = body.data
  const providerRef = String(tx.id)
  const currency = tx.currency || 'USD'
  const amount = Number(tx.amount || 0)
  const cached = await redis.get<string>(`rate:USD:${currency}`)
  const rate = cached ? Number(cached) : 1
  const amountUsd = +(amount / rate).toFixed(2)

  const exists = await Transaction.findOne({ providerRef })
  if (!exists) {
    const userId = tx.meta?.userId || tx.tx_ref
    await Transaction.create({
      userId, type: 'deposit', method: 'card', provider: 'flutterwave',
      currency, amount, amountUsd, fxRate: rate, status: 'confirmed', providerRef
    })
    await Wallet.updateOne({ userId }, { $inc: { 'balances.USD': amountUsd } }, { upsert: true })
  }
  return NextResponse.json({ ok: true })
}
