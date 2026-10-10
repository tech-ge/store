import { NextResponse } from 'next/server'
import { connectMongo, Transaction, Wallet } from '@dd/db-mongo'
import { redis } from '@dd/redis-client/src/client'

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const stk = body.Body?.stkCallback
  if (!stk || stk.ResultCode !== 0) return NextResponse.json({ ok: true })

  await connectMongo()
  const amountKes = stk.CallbackMetadata?.Item?.find((i: any) => i.Name === 'Amount')?.Value || 0
  const accountRef = stk.CallbackMetadata?.Item?.find((i: any) => i.Name === 'AccountReference')?.Value
  const txnId = stk.CheckoutRequestID

  const cached = await redis.get<string>(`rate:USD:KES`)
  const rate = cached ? Number(cached) : 129
  const amountUsd = +(amountKes / rate).toFixed(2)

  const exists = await Transaction.findOne({ providerRef: txnId })
  if (!exists) {
    await Transaction.create({
      userId: accountRef, type: 'deposit', method: 'mobile_money', provider: 'mpesa',
      currency: 'KES', amount: amountKes, amountUsd, fxRate: rate,
      status: 'confirmed', providerRef: txnId
    })
    await Wallet.updateOne({ userId: accountRef }, { $inc: { 'balances.USD': amountUsd } }, { upsert: true })
  }

  return NextResponse.json({ ok: true })
}
