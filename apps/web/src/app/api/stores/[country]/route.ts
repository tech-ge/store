import { NextResponse } from 'next/server'
import { connectMongo, Store, Product } from '@dd/db-mongo'

export async function GET(_req: Request, { params }: { params: { country: string } }) {
  await connectMongo()
  const store: any = await Store.findOne({ countryCode: params.country.toUpperCase() }).lean()
  if (!store) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const products = await Product.find({ storeId: store._id }).limit(60).lean()
  return NextResponse.json({
    store: {
      countryCode: store.countryCode,
      countryName: store.countryName,
      storeName: store.storeName || `${store.countryName} Store`,
      currency: store.currency,
      currencySymbol: store.currencySymbol
    },
    products: products.map((p: any) => ({
      id: String(p._id),
      title: p.title,
      image: p.images?.[0] || '',
      priceUsd: p.priceUsd,
      categorySlug: p.categorySlug
    }))
  })
}
