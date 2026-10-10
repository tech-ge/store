import { NextResponse } from 'next/server'
import { connectMongo, Product, Store, Seller } from '@dd/db-mongo'
import { requireAuth } from '@dd/auth/src/require-auth'

export async function GET(req: Request) {
  try {
    const user = await requireAuth(req)
    await connectMongo()
    const products = await Product.find({ sellerId: user.sub }).sort({ createdAt: -1 }).lean()
    return NextResponse.json({ products })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 401 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth(req)
    const body = await req.json()
    const { title, description, images, categorySlug, storeCountry, priceUsd, stock } = body

    if (!title || !description || !Array.isArray(images) || !images.length || !categorySlug || !storeCountry || typeof priceUsd !== 'number') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await connectMongo()

    const seller = await Seller.findOne({ userId: user.sub }).lean()
    if (!seller) return NextResponse.json({ error: 'Seller account not found' }, { status: 404 })

    const store = await Store.findOne({ countryCode: storeCountry.toUpperCase() }).lean()
    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 })

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 80)

    const product = await Product.create({
      title,
      slug,
      description,
      images,
      categorySlug,
      storeId: (store as any)._id,
      sellerId: user.sub,
      addedByAdmin: false,
      priceUsd,
      stock: Number(stock) || 0,
      isGlobal: false
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 401 })
  }
}
