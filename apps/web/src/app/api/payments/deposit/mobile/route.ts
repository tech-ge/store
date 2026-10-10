import { NextResponse } from 'next/server'
import { requireAuth } from '@dd/auth/src/require-auth'
import { mpesaStkPush } from '@dd/payments/src/mpesa'

export async function POST(req: Request) {
  try {
    const user = await requireAuth(req)
    const { phone, amountKes } = await req.json()
    if (!phone || !amountKes) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

    const result = await mpesaStkPush({
      phone, amountKes,
      accountRef: user.sub,
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhooks/mpesa`
    })
    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 401 })
  }
}
