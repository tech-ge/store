import { notFound } from 'next/navigation'
import { connectMongo, Store, Product } from '@dd/db-mongo'
import { Container } from '@/components/layout/Container'
import { ProductGrid } from '@/components/product/ProductGrid'

export const dynamic = 'force-dynamic'

interface StoreLean {
  _id: unknown
  countryCode: string
  countryName: string
  storeName: string
  currency: string
}

interface ProductLean {
  _id: unknown
  title: string
  images?: string[]
  priceUsd: number
  storeId: unknown
  sellerId?: unknown | null
  categorySlug: string
}

export default async function StorePage({ params }: { params: { country: string } }) {
  await connectMongo()
  const store = await Store.findOne({ countryCode: params.country.toUpperCase() }).lean<StoreLean | null>()
  if (!store) notFound()

  const products = await Product.find({ storeId: store._id }).limit(60).lean<ProductLean[]>()

  return (
    <Container className="py-10">
      <h1 className="font-display text-3xl text-navy mb-1">{store.storeName}</h1>
      <p className="text-sm text-text-muted mb-6">Country: {store.countryName} · Currency: {store.currency}</p>
      <ProductGrid products={products.map(p => ({
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
