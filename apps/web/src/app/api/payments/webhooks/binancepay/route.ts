import { NextResponse } from 'next/server'
import { connectMongo, Transaction, Wallet } from '@dd/db-mongo'

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  if (body.bizStatus !== 'PAY_SUCCESS') return NextResponse.json({ ok: true })
  const data = body.data || {}
  const providerRef = String(data.merchantTradeNo || '')
  if (!providerRef) return NextResponse.json({ ok: true })
  await connectMongo()
  const exists = await Transaction.findOne({ providerRef })
  if (!exists) {
    const userId = data.passThroughInfo || data.userId
    const amount = Number(data.totalFee || 0)
    await Transaction.create({
      userId, type: 'deposit', method: 'crypto', provider: 'binancepay',
      currency: 'USDT', amount, amountUsd: amount, fxRate: 1,
      status: 'confirmed', providerRef
    })
    await Wallet.updateOne({ userId }, { $inc: { 'balances.USD': amount } }, { upsert: true })
  }
  return NextResponse.json({ ok: true })
}
