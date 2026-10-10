import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { connectMongo, User, Session } from '@dd/db-mongo'
import { hashPassword } from '@dd/security'
import { redis } from '@dd/redis-client/src/client'

export async function POST(req: Request) {
  const { token, newPassword } = await req.json().catch(() => ({}))
  if (!token || !newPassword || newPassword.length < 8) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const hash = crypto.createHash('sha256').update(token).digest('hex')
  const userId = await redis.get<string>(`pwreset:${hash}`)
  if (!userId) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })

  await connectMongo()
  const passwordHash = await hashPassword(newPassword)
  await User.updateOne({ _id: userId }, { $set: { passwordHash } })
  await Session.deleteMany({ userId })
  await redis.del(`pwreset:${hash}`)
  return NextResponse.json({ ok: true })
}
