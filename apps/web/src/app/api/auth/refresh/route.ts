import { NextResponse } from 'next/server'
import { connectMongo, Session, User } from '@dd/db-mongo'
import { verifyRefresh, issueAccessToken } from '@dd/security'

interface UserLean {
  _id: unknown
  emailNormalized: string
  role: string
  countryCode: string
  status: string
}

export async function POST(req: Request) {
  const token = req.headers.get('cookie')?.match(/refreshToken=([^;]+)/)?.[1]
  if (!token) return NextResponse.json({ error: 'No refresh token' }, { status: 401 })

  try {
    const { sub, sid } = await verifyRefresh(token)
    await connectMongo()
    const session = await Session.findById(sid).lean()
    if (!session || (session as any).expiresAt < new Date()) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 })
    }

    const user = await User.findById(sub).lean<UserLean | null>()
    if (!user || user.status !== 'active') {
      return NextResponse.json({ error: 'Account not active' }, { status: 403 })
    }

    const accessToken = await issueAccessToken({
      sub: String(user._id), email: user.emailNormalized, role: user.role, country: user.countryCode
    })
    return NextResponse.json({ accessToken })
  } catch {
    return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 })
  }
}
