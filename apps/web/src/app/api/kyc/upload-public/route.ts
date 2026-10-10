import { NextResponse } from 'next/server'

const MAX_BYTES = 4 * 1024 * 1024 // 4MB after base64 overhead
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']

export async function POST(req: Request) {
  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'File too large (max 4MB)' }, { status: 413 })
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: 'Only JPG, PNG, or WebP allowed' }, { status: 415 })

  const buf = Buffer.from(await file.arrayBuffer())
  const dataUrl = `data:${file.type};base64,${buf.toString('base64')}`
  return NextResponse.json({ url: dataUrl })
}
