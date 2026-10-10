export async function createCoinbaseCharge(params: {
  amountUsd: number
  userId: string
  redirectUrl: string
}) {
  const key = process.env.COINBASE_COMMERCE_API_KEY
  if (!key) throw new Error('COINBASE_COMMERCE_API_KEY missing')

  const res = await fetch('https://api.commerce.coinbase.com/charges', {
    method: 'POST',
    headers: {
      'X-CC-Api-Key': key,
      'X-CC-Version': '2018-03-22',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'Door Delivery deposit',
      description: 'Wallet top up',
      pricing_type: 'fixed_price',
      local_price: { amount: params.amountUsd.toFixed(2), currency: 'USD' },
      metadata: { userId: params.userId },
      redirect_url: params.redirectUrl
    })
  })
  return res.json()
}
