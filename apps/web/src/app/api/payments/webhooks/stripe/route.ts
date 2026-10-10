import { NextResponse } from 'next/server'
import { getStripe } from '@dd/payments/src/stripe'
import { connectMongo, Transaction, Wallet } from '@dd/db-mongo'

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature')
  if (!sig) return NextResponse.json({ error: 'no signature' }, { status: 400 })

  const body = await req.text()
  let event: any
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'invalid signature' }, { status: 400 })
  }

  await connectMongo()

  if (event.type === 'checkout.session.completed') {
    const s = event.data.object
    const userId = s.metadata?.userId
    const amountUsd = (s.amount_total || 0) / 100

    const exists = await Transaction.findOne({ providerRef: s.id })
    if (!exists) {
      await Transaction.create({
        userId, type: 'deposit', method: 'card', provider: 'stripe',
        currency: 'USD', amount: amountUsd, amountUsd, fxRate: 1,
        status: 'confirmed', providerRef: s.id
      })
      await Wallet.updateOne({ userId }, { $inc: { 'balances.USD': amountUsd } }, { upsert: true })
    }
  }

  return NextResponse.json({ ok: true })
}
