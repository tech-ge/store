import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { connectMongo, User, Session, LoginAttempt } from '@dd/db-mongo'
import { verifyPassword, issueAccessToken, issueRefreshToken, hashIdNumber, normalizeIdNumber, safeCompareHex } from '@dd/security'
import { LoginSchema } from '@dd/validation/src/auth'

interface UserWithSecrets {
  _id: unknown
  fullName: string
  emailNormalized: string
  countryCode: string
  role: string
  status: string
  passwordHash: string
  idNumberHash: string
  failedLoginCount: number
  lockedUntil?: Date
  save: () => Promise<unknown>
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const parsed = LoginSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { email, idNumber, password } = parsed.data
  const emailNorm = email.trim().toLowerCase()
  const ip = req.headers.get('x-forwarded-for') || 'unknown'
  const ua = req.headers.get('user-agent') || 'unknown'
  const fp = crypto.createHash('sha256').update(ua + ip).digest('hex')

  await connectMongo()
  const user: any = await User.findOne({ emailNormalized: emailNorm })
    .select('+passwordHash +idNumberHash')

  const INVALID = { error: 'Invalid email, ID number, or password' }

  if (!user) {
    await LoginAttempt.create({ email: emailNorm, ip, deviceFingerprint: fp, userAgent: ua, success: false, reason: 'no_user' })
    return NextResponse.json(INVALID, { status: 401 })
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return NextResponse.json({ error: 'Account temporarily locked', retryAt: user.lockedUntil }, { status: 423 })
  }

  if (user.status !== 'active') {
    const map: Record<string, string> = {
      pending_kyc: 'Account awaiting admin approval',
      rejected: 'Application rejected',
      suspended: 'Account suspended',
      blocked: 'Account blocked'
    }
    await LoginAttempt.create({ email: emailNorm, ip, deviceFingerprint: fp, userAgent: ua, success: false, reason: 'bad_status' })
    return NextResponse.json({ error: map[user.status] || 'Account not active' }, { status: 403 })
  }

  const incomingHash = hashIdNumber(normalizeIdNumber(idNumber), user.countryCode)
  if (!safeCompareHex(incomingHash, user.idNumberHash)) {
    await bumpFailure(user)
    await LoginAttempt.create({ email: emailNorm, idNumberHash: incomingHash, ip, deviceFingerprint: fp, userAgent: ua, success: false, reason: 'bad_id' })
    return NextResponse.json(INVALID, { status: 401 })
  }

  const ok = await verifyPassword(user.passwordHash, password)
  if (!ok) {
    await bumpFailure(user)
    await LoginAttempt.create({ email: emailNorm, idNumberHash: incomingHash, ip, deviceFingerprint: fp, userAgent: ua, success: false, reason: 'bad_password' })
    return NextResponse.json(INVALID, { status: 401 })
  }

  user.failedLoginCount = 0
  user.lockedUntil = undefined
  user.lastLoginAt = new Date()
  user.lastLoginIp = ip
  await user.save()

  const session = await Session.create({
    userId: user._id, deviceFingerprint: fp, userAgent: ua, ip,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  })

  const accessToken = await issueAccessToken({
    sub: String(user._id), email: user.emailNormalized, role: user.role, country: user.countryCode
  })
  const refreshToken = await issueRefreshToken({ sub: String(user._id), sid: String(session._id) })

  const res = NextResponse.json({
    accessToken,
    user: {
      id: user._id, fullName: user.fullName, email: user.emailNormalized,
      role: user.role, countryCode: user.countryCode, status: user.status
    }
  })

  res.cookies.set('refreshToken', refreshToken, {
    httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production',
    path: '/api/auth/refresh', maxAge: 30 * 24 * 60 * 60
  })

  await LoginAttempt.create({ email: emailNorm, ip, deviceFingerprint: fp, userAgent: ua, success: true, reason: 'success' })
  return res
}

async function bumpFailure(user: any) {
  user.failedLoginCount = (user.failedLoginCount || 0) + 1
  if (user.failedLoginCount >= 5) {
    user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000)
    user.failedLoginCount = 0
  }
  await user.save()
}
