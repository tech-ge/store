import Link from 'next/link'
import { connectMongo, Category, Product, Store } from '@dd/db-mongo'
import { Container } from '@/components/layout/Container'
import { CategoryGrid } from '@/components/categories/CategoryGrid'
import { ProductGrid } from '@/components/product/ProductGrid'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export const dynamic = 'force-dynamic'


interface CategoryLean { _id: unknown; slug: string; name: string }
interface ProductLean {
  _id: unknown; title: string; images?: string[]; priceUsd: number
  storeId: unknown; sellerId?: unknown | null; categorySlug: string
}
interface StoreLean { _id: unknown; countryCode: string; countryName: string; currency: string }

export default async function HomePage() {
  await connectMongo()
  const [categories, products, stores] = await Promise.all([
    Category.find({ isActive: true }).sort({ order: 1 }).lean<CategoryLean[]>(),
    Product.find({}).sort({ createdAt: -1 }).limit(20).lean<ProductLean[]>(),
    Store.find({ isActive: true }).lean<StoreLean[]>()
  ])

  return (
    <>
      <Header />
      <Container className="py-8 space-y-10">
        <section>
          <h1 className="font-display text-3xl md:text-4xl text-navy mb-2">From any store, to any door.</h1>
          <p className="text-text-muted">Shop worldwide. Prices shown in USD and your local currency.</p>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl text-navy">Categories</h2>
            <Link href="/categories" className="text-sm text-brand">All categories</Link>
          </div>
          <CategoryGrid categories={categories.map(c => ({ slug: c.slug, name: c.name }))} />
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl text-navy">New arrivals</h2>
          </div>
          <ProductGrid products={products.map(p => ({
            id: String(p._id),
            title: p.title,
            image: p.images?.[0] || '',
            priceUsd: p.priceUsd,
            storeId: String(p.storeId),
            sellerId: p.sellerId ? String(p.sellerId) : null,
            categorySlug: p.categorySlug
          }))} />
        </section>

        <section>
          <h2 className="font-display text-xl text-navy mb-4">Available stores</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stores.map(s => (
              <Link key={String(s._id)} href={`/stores/${s.countryCode}`} className="bg-white rounded-xl border border-surface-border p-4 hover:border-brand">
                <div className="text-sm font-medium text-navy">{s.countryName}</div>
                <div className="text-xs text-text-muted mt-1">{s.currency}</div>
              </Link>
            ))}
          </div>
        </section>
      </Container>
      <Footer />
    </>
  )
}
