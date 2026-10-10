export async function createPixCharge(params: {
  amountBrl: number
  reference: string
  callbackUrl: string
}) {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN
  if (!token) throw new Error('MERCADO_PAGO_ACCESS_TOKEN missing')

  const res = await fetch('https://api.mercadopago.com/v1/payments', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      transaction_amount: params.amountBrl,
      description: 'Door Delivery deposit',
      payment_method_id: 'pix',
      external_reference: params.reference,
      notification_url: params.callbackUrl
    })
  })
  return res.json()
}
