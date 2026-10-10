import { NextResponse } from 'next/server'
import { uploadToR2 } from '@dd/storage/src/upload'
import { requireAuth } from '@dd/auth/src/require-auth'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const user = await requireAuth(req)
    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    const buf = Buffer.from(await file.arrayBuffer())
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
    const key = `kyc/${user.sub}/${crypto.randomBytes(8).toString('hex')}.${ext}`

    const url = await uploadToR2({ key, body: buf, contentType: file.type || 'image/jpeg' })
    return NextResponse.json({ url, key })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 401 })
  }
}
