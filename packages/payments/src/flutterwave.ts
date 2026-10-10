export async function createFlutterwavePayment(params: {
  amount: number
  currency: string
  email: string
  txRef: string
  redirectUrl: string
}) {
  const key = process.env.FLUTTERWAVE_SECRET_KEY
  if (!key) throw new Error('FLUTTERWAVE_SECRET_KEY missing')

  const res = await fetch('https://api.flutterwave.com/v3/payments', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      tx_ref: params.txRef,
      amount: params.amount,
      currency: params.currency,
      redirect_url: params.redirectUrl,
      customer: { email: params.email },
      customizations: { title: 'Door Delivery', description: 'Wallet deposit' }
    })
  })
  return res.json()
}
