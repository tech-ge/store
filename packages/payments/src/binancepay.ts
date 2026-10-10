import crypto from 'crypto'

export async function createBinancePayOrder(params: {
  amountUsd: number
  merchantTradeNo: string
}) {
  const apiKey = process.env.BINANCE_PAY_API_KEY!
  const secret = process.env.BINANCE_PAY_SECRET!

  const body = JSON.stringify({
    env: { terminalType: 'WEB' },
    merchantTradeNo: params.merchantTradeNo,
    orderAmount: params.amountUsd,
    currency: 'USDT',
    goods: { goodsType: '01', goodsCategory: 'Z000', referenceGoodsId: 'wallet', goodsName: 'Wallet deposit' }
  })

  const timestamp = Date.now().toString()
  const nonce = crypto.randomBytes(16).toString('hex').toUpperCase()
  const payload = `${timestamp}\n${nonce}\n${body}\n`
  const signature = crypto.createHmac('sha512', secret).update(payload).digest('hex').toUpperCase()

  const res = await fetch('https://bpay.binanceapi.com/binancepay/openapi/v3/order', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'BinancePay-Timestamp': timestamp,
      'BinancePay-Nonce': nonce,
      'BinancePay-Certificate-SN': apiKey,
      'BinancePay-Signature': signature
    },
    body
  })
  return res.json()
}
