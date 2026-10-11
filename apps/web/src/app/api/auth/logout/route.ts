import { NextResponse } from 'next/server'
import { connectMongo, Session } from '@dd/db-mongo'
import { verifyRefresh } from '@dd/security'
import { clearAuthCookies } from '@/lib/auth-cookies'

export async function POST(req: Request) {
  const token = req.headers.get('cookie')?.match(/(?:^|;\s*)refreshToken=([^;]+)/)?.[1]
  if (token) {
    try {
      const { sid } = await verifyRefresh(token)
      await connectMongo()
      await Session.deleteOne({ _id: sid })
    } catch {}
  }
  const res = NextResponse.json({ ok: true })
  clearAuthCookies(res)
  return res
}
