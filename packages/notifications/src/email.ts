import { Resend } from 'resend'

let resend: Resend | null = null

function client() {
  if (!resend) {
    const key = process.env.RESEND_API_KEY
    if (!key) throw new Error('RESEND_API_KEY missing')
    resend = new Resend(key)
  }
  return resend
}

export async function sendEmail(params: {
  to: string
  subject: string
  html: string
  from?: string
}) {
  return client().emails.send({
    from: params.from || 'Door Delivery <noreply@door-delivery.app>',
    to: params.to,
    subject: params.subject,
    html: params.html
  })
}
