import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { connectMongo, User } from '@dd/db-mongo'
import { hashIdNumber, normalizeIdNumber, safeCompareHex } from '@dd/security'
import { sendEmail } from '@dd/notifications/src/email'
import { redis } from '@dd/redis-client/src/client'

export async function POST(req: Request) {
  const { email, idNumber } = await req.json().catch(() => ({}))
  if (!email || !idNumber) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  await connectMongo()
  const user: any = await User.findOne({ emailNormalized: email.toLowerCase().trim() })
    .select('+idNumberHash')

  if (!user || !safeCompareHex(hashIdNumber(normalizeIdNumber(idNumber), user.countryCode), user.idNumberHash)) {
    return NextResponse.json({ ok: true })
  }

  const raw = crypto.randomBytes(32).toString('hex')
  const hash = crypto.createHash('sha256').update(raw).digest('hex')
  await redis.set(`pwreset:${hash}`, String(user._id), { ex: 3600 })

  const link = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${raw}`
  await sendEmail({
    to: user.emailNormalized,
    subject: 'Reset your Door Delivery password',
    html: `<p>Click the link below to reset your password. Expires in 1 hour.</p><p><a href="${link}">${link}</a></p>`
  }).catch(() => null)

  return NextResponse.json({ ok: true })
}
