import { NextResponse } from 'next/server'
import { connectMongo, Product, Store } from '@dd/db-mongo'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const q = url.searchParams.get('q')?.trim() || ''
  const category = url.searchParams.get('category') || ''
  const scope = url.searchParams.get('scope') || 'all'
  const minPrice = Number(url.searchParams.get('minPrice') || 0)
  const maxPrice = Number(url.searchParams.get('maxPrice') || 0)
  const sort = url.searchParams.get('sort') || 'newest'
  const country = (url.searchParams.get('country') || '').toUpperCase()
  const limit = Math.min(Number(url.searchParams.get('limit') || 60), 100)

  await connectMongo()

  const filter: any = { stock: { $gt: 0 } }
  if (q) filter.title = new RegExp(q, 'i')
  if (category) filter.categorySlug = category
  if (scope === 'local') filter.isGlobal = false
  if (scope === 'global') filter.isGlobal = true
  if (minPrice || maxPrice) {
    filter.priceUsd = {}
    if (minPrice) filter.priceUsd.$gte = minPrice
    if (maxPrice) filter.priceUsd.$lte = maxPrice
  }

  let storeId: any = null
  let importMarkupPercent = 15
  if (country) {
    const store: any = await Store.findOne({ countryCode: country }).lean()
    if (store) {
      storeId = store._id
      importMarkupPercent = store.importMarkupPercent ?? 15
    }
  }

  if (storeId) {
    filter.$or = [{ storeId }, { isGlobal: true }]
  }

  const sortMap: Record<string, any> = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    priceAsc: { priceUsd: 1 },
    priceDesc: { priceUsd: -1 }
  }

  const products = await Product.find(filter).sort(sortMap[sort] || sortMap.newest).limit(limit).lean()

  return NextResponse.json({
    importMarkupPercent,
    products: products.map((p: any) => ({
      id: String(p._id),
      title: p.title,
      image: p.images?.[0] || '/placeholder.svg',
      priceUsd: p.priceUsd,
      displayPriceUsd: p.isGlobal ? +(p.priceUsd * (1 + importMarkupPercent / 100)).toFixed(2) : p.priceUsd,
      categorySlug: p.categorySlug,
      storeId: String(p.storeId),
      sellerId: p.sellerId ? String(p.sellerId) : null,
      isGlobal: !!p.isGlobal,
      stock: p.stock,
      createdAt: p.createdAt
    }))
  })
}
