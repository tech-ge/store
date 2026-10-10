import { connectMongo, Product } from '@dd/db-mongo'
import { Container } from '@/components/layout/Container'
import { ProductGrid } from '@/components/product/ProductGrid'

export const dynamic = 'force-dynamic'

interface ProductLean {
  _id: unknown
  title: string
  images?: string[]
  priceUsd: number
  storeId: unknown
  sellerId?: unknown | null
  categorySlug: string
}

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q?.trim() || ''
  await connectMongo()

  let products: ProductLean[] = []
  if (q) {
    products = await Product.find({ $text: { $search: q } }).limit(60).lean<ProductLean[]>()
    if (!products.length) {
      products = await Product.find({ title: new RegExp(q, 'i') }).limit(60).lean<ProductLean[]>()
    }
  }

  return (
    <Container className="py-8">
      <h1 className="font-display text-2xl text-navy mb-2">Search results</h1>
      <p className="text-sm text-text-muted mb-6">Query: <span className="font-medium">{q}</span></p>
      <ProductGrid
        products={products.map(p => ({
          id: String(p._id),
          title: p.title,
          image: p.images?.[0] || '',
          priceUsd: p.priceUsd,
          storeId: String(p.storeId),
          sellerId: p.sellerId ? String(p.sellerId) : null,
          categorySlug: p.categorySlug
        }))}
      />
    </Container>
  )
}
