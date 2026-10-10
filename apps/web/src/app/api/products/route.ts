import { NextResponse } from 'next/server'
import { connectMongo, Product } from '@dd/db-mongo'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const category = url.searchParams.get('category')
  const q = url.searchParams.get('q')
  const limit = Math.min(Number(url.searchParams.get('limit') || 60), 100)

  await connectMongo()
  const filter: any = {}
  if (category) filter.categorySlug = category
  if (q) filter.title = new RegExp(q, 'i')

  const products = await Product.find(filter).sort({ createdAt: -1 }).limit(limit).lean()
  return NextResponse.json({
    products: products.map((p: any) => ({
      id: String(p._id),
      title: p.title,
      image: p.images?.[0] || '',
      priceUsd: p.priceUsd,
      categorySlug: p.categorySlug,
      storeId: String(p.storeId)
    }))
  })
}
