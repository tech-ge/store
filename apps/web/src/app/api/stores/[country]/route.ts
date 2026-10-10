import { NextResponse } from 'next/server'
import { connectMongo, Store, Product } from '@dd/db-mongo'

interface StoreLean {
  _id: unknown
  countryCode: string
  countryName: string
  currency: string
}

interface ProductLean {
  _id: unknown
  title: string
  images?: string[]
  priceUsd: number
  categorySlug: string
}

export async function GET(_req: Request, { params }: { params: { country: string } }) {
  await connectMongo()
  const store = await Store
    .findOne({ countryCode: params.country.toUpperCase() })
    .lean<StoreLean | null>()
  if (!store) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const products = await Product
    .find({ storeId: store._id })
    .limit(60)
    .lean<ProductLean[]>()
  return NextResponse.json({
    store: {
      countryCode: store.countryCode,
      countryName: store.countryName,
      currency: store.currency
    },
    products: products.map(p => ({
      id: String(p._id),
      title: p.title,
      image: p.images?.[0] || '',
      priceUsd: p.priceUsd,
      categorySlug: p.categorySlug
    }))
  })
}
