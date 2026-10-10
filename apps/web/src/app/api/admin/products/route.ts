import { NextResponse } from 'next/server'
import { connectMongo, Product, Store, AuditLog } from '@dd/db-mongo'
import { requireAuth } from '@dd/auth/src/require-auth'
import { requireRole } from '@dd/auth/src/require-role'
import crypto from 'crypto'

interface AuditLean { hash: string }

export async function POST(req: Request) {
  try {
    const payload = await requireAuth(req)
    requireRole(payload, 'admin')

    const body = await req.json()
    const { title, description, images, categorySlug, storeId, storeCountry, priceUsd, stock, isGlobal } = body

    if (!title || !description || !Array.isArray(images) || !images.length || !categorySlug || !storeCountry || typeof priceUsd !== 'number') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await connectMongo()
    const store = await Store.findOne({ countryCode: String(storeCountry).toUpperCase() }).lean()
    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 })

    const slug = String(title).toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 80)

    const product = await Product.create({
      title,
      slug,
      description,
      images,
      categorySlug,
      storeId: (store as any)._id,
      sellerId: null,
      addedByAdmin: true,
      priceUsd,
      stock: Number(stock) || 0,
      isGlobal: Boolean(isGlobal)
    })

    const prev = await AuditLog.findOne().sort({ createdAt: -1 }).lean<AuditLean | null>()
    const auditBody = JSON.stringify({ title, storeCountry })
    const hash = crypto.createHash('sha256').update((prev?.hash || '') + auditBody).digest('hex')

    await AuditLog.create({
      actorId: payload.sub, actorRole: 'admin', action: 'create_product',
      resource: 'product', resourceId: String(product._id),
      payload: { title, storeCountry }, hash, prevHash: prev?.hash
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 401 })
  }
}
