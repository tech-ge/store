import { NextResponse } from 'next/server'
import { connectMongo, User } from '@dd/db-mongo'
import { requireAuth } from '@dd/auth/src/require-auth'

interface UserLean {
  _id: unknown
  fullName: string
  emailNormalized: string
  role: string
  countryCode: string
  status: string
}

export async function GET(req: Request) {
  try {
    const payload = await requireAuth(req)
    await connectMongo()
    const user = await User.findById(payload.sub).lean<UserLean | null>()
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({
      id: user._id,
      fullName: user.fullName,
      email: user.emailNormalized,
      role: user.role,
      countryCode: user.countryCode,
      status: user.status
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 401 })
  }
}
