import { NextResponse } from 'next/server'
import { connectMongo, Product, Store } from '@dd/db-mongo'
import { requireAuth } from '@dd/auth/src/require-auth'
import { CreateProductSchema } from '@dd/validation/src/product'

export async function GET(req: Request) {
  try {
    const payload = await requireAuth(req)
    await connectMongo()
    const products = await Product.find({ sellerId: payload.sub }).sort({ createdAt: -1 }).lean()
    return NextResponse.json({ products })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 401 })
  }
}

export async function POST(req: Request) {
  try {
    const payload = await requireAuth(req)
    const parsed = CreateProductSchema.safeParse(await req.json())
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

    await connectMongo()
    const store = await Store.findById(parsed.data.storeId)
    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 })

    const slug = parsed.data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 80)

    const product = await Product.create({
      ...parsed.data,
      slug,
      sellerId: payload.sub,
      addedByAdmin: false
    })
    return NextResponse.json({ product }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 401 })
  }
}
