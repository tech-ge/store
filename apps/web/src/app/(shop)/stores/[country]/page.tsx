import { notFound } from 'next/navigation'
import { connectMongo, Store, Product } from '@dd/db-mongo'
import { Container } from '@/components/layout/Container'
import { ProductGrid } from '@/components/product/ProductGrid'

export const dynamic = 'force-dynamic'

export default async function StorePage({ params }: { params: { country: string } }) {
  await connectMongo()
  const store: any = await Store.findOne({ countryCode: params.country.toUpperCase() }).lean()
  if (!store) notFound()

  const products = await Product.find({ storeId: store._id, stock: { $gt: 0 } })
    .sort({ createdAt: -1 }).limit(60).lean()

  return (
    <Container className="py-10">
      <h1 className="font-display text-3xl text-navy mb-1">{store.storeName || `${store.countryName} Store`}</h1>
      <p className="text-sm text-text-muted mb-6">Country: {store.countryName} · Currency: {store.currency}</p>
      <ProductGrid products={products.map((p: any) => ({
        id: String(p._id),
        title: p.title,
        image: p.images?.[0] || '/placeholder.svg',
        priceUsd: p.priceUsd,
        storeId: String(p.storeId),
        sellerId: p.sellerId ? String(p.sellerId) : null,
        categorySlug: p.categorySlug
      }))} />
    </Container>
  )
}
