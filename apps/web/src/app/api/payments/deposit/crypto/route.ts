import { NextResponse } from 'next/server'
import { connectMongo, CryptoAddress } from '@dd/db-mongo'
import { requireAuth } from '@dd/auth/src/require-auth'
import { createTrc20Address } from '@dd/payments/src/usdt'

export async function POST(req: Request) {
  try {
    const user = await requireAuth(req)
    await connectMongo()

    let record = await CryptoAddress.findOne({ userId: user.sub, network: 'TRC20' })
    if (!record) {
      const created = await createTrc20Address()
      record = await CryptoAddress.create({
        userId: user.sub,
        network: 'TRC20',
        asset: 'USDT',
        address: created.address,
        privateKeyEncrypted: created.privateKey
      })
    }

    return NextResponse.json({ address: record.address, network: record.network, asset: record.asset })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 401 })
  }
}
