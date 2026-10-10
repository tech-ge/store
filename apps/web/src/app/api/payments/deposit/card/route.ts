import { NextResponse } from 'next/server'
import { requireAuth } from '@dd/auth/src/require-auth'
import { createStripeCheckout } from '@dd/payments/src/stripe'

export async function POST(req: Request) {
  try {
    const user = await requireAuth(req)
    const { amountUsd } = await req.json()
    if (!amountUsd || amountUsd < 1) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })

    const session = await createStripeCheckout({
      amountUsd,
      userId: user.sub,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/wallet?status=success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/wallet?status=cancelled`
    })
    return NextResponse.json({ url: session.url, id: session.id })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 401 })
  }
}
