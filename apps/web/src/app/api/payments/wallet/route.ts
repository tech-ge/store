import { NextResponse } from 'next/server'
import { connectMongo, Wallet, Transaction } from '@dd/db-mongo'
import { requireAuth } from '@dd/auth/src/require-auth'

export async function GET(req: Request) {
  try {
    const user = await requireAuth(req)
    await connectMongo()
    const wallet = await Wallet.findOne({ userId: user.sub }).lean()
    const txs = await Transaction.find({ userId: user.sub }).sort({ createdAt: -1 }).limit(50).lean()
    return NextResponse.json({ wallet, transactions: txs })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 401 })
  }
}
