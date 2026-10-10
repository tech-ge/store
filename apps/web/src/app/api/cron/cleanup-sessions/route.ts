import { NextResponse } from 'next/server'
import { connectMongo, Session } from '@dd/db-mongo'

export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  await connectMongo()
  const result = await Session.deleteMany({ expiresAt: { $lt: new Date() } })
  return NextResponse.json({ deleted: result.deletedCount })
}
