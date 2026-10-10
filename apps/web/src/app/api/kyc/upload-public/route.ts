import { NextResponse } from 'next/server'
import { uploadToR2 } from '@dd/storage/src/upload'
import crypto from 'crypto'

const MAX_BYTES = 8 * 1024 * 1024 // 8MB
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']

export async function POST(req: Request) {
  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'File too large (max 8MB)' }, { status: 413 })
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: 'Only images allowed' }, { status: 415 })

  const buf = Buffer.from(await file.arrayBuffer())
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const key = `kyc-pending/${crypto.randomBytes(16).toString('hex')}.${ext}`

  try {
    const url = await uploadToR2({ key, body: buf, contentType: file.type })
    return NextResponse.json({ url, key })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Upload failed' }, { status: 500 })
  }
}
