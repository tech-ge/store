import { NextResponse } from 'next/server'
import { connectMongo, Product } from '@dd/db-mongo'

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get('q')?.trim() || ''
  if (!q) return NextResponse.json({ results: [] })
  await connectMongo()
  const products = await Product.find({ title: new RegExp(q, 'i') }).limit(8).lean()
  return NextResponse.json({
    results: products.map((p: any) => ({
      id: String(p._id),
      title: p.title,
      image: p.images?.[0] || '',
      priceUsd: p.priceUsd,
      categorySlug: p.categorySlug
    }))
  })
}
