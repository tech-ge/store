import twilio from 'twilio'

let client: ReturnType<typeof twilio> | null = null

function getClient() {
  if (!client) {
    const sid = process.env.TWILIO_ACCOUNT_SID
    const token = process.env.TWILIO_AUTH_TOKEN
    if (!sid || !token) throw new Error('Twilio credentials missing')
    client = twilio(sid, token)
  }
  return client
}

export async function sendSms(params: { to: string; body: string }) {
  const from = process.env.TWILIO_FROM_NUMBER
  if (!from) throw new Error('TWILIO_FROM_NUMBER missing')
  return getClient().messages.create({ from, to: params.to, body: params.body })
}
