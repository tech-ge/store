import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { connectMongo, Transaction, Wallet } from '@dd/db-mongo'

export async function POST(req: Request) {
  const sig = req.headers.get('x-cc-webhook-signature')
  const body = await req.text()

  const expected = crypto
    .createHmac('sha256', process.env.COINBASE_COMMERCE_WEBHOOK_SECRET || '')
    .update(body).digest('hex')

  if (sig !== expected) return NextResponse.json({ error: 'invalid signature' }, { status: 400 })

  const event = JSON.parse(body)
  if (event.event?.type === 'charge:confirmed') {
    await connectMongo()
    const charge = event.event.data
    const userId = charge.metadata?.userId
    const amountUsd = Number(charge.pricing?.local?.amount || 0)

    const exists = await Transaction.findOne({ providerRef: charge.id })
    if (!exists) {
      await Transaction.create({
        userId, type: 'deposit', method: 'crypto', provider: 'coinbase',
        currency: 'USD', amount: amountUsd, amountUsd, fxRate: 1,
        status: 'confirmed', providerRef: charge.id
      })
      await Wallet.updateOne({ userId }, { $inc: { 'balances.USD': amountUsd } }, { upsert: true })
    }
  }

  return NextResponse.json({ ok: true })
}
