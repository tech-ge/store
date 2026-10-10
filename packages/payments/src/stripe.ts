import Stripe from 'stripe'

let cached: Stripe | null = null

export function getStripe(): Stripe {
  if (!cached) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY missing')
    cached = new Stripe(key, { apiVersion: '2024-06-20' })
  }
  return cached
}

export async function createStripeCheckout(params: {
  amountUsd: number
  userId: string
  successUrl: string
  cancelUrl: string
}) {
  const stripe = getStripe()
  return stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        unit_amount: Math.round(params.amountUsd * 100),
        product_data: { name: 'Wallet deposit' }
      },
      quantity: 1
    }],
    metadata: { userId: params.userId },
    success_url: params.successUrl,
    cancel_url: params.cancelUrl
  })
}
