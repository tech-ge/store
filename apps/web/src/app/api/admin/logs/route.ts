import { NextResponse } from 'next/server'
import { connectMongo, AuditLog } from '@dd/db-mongo'
import { requireAuth } from '@dd/auth/src/require-auth'
import { requireRole } from '@dd/auth/src/require-role'

export async function GET(req: Request) {
  try {
    const payload = await requireAuth(req)
    requireRole(payload, 'admin')
    await connectMongo()
    const logs = await AuditLog.find({}).sort({ createdAt: -1 }).limit(500).lean()
    return NextResponse.json({ logs })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 401 })
  }
}
