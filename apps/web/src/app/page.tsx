import Link from 'next/link'
import { connectMongo, Category, Store } from '@dd/db-mongo'
import { Container } from '@/components/layout/Container'
import { CategoryGrid } from '@/components/categories/CategoryGrid'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { HomeProducts } from '@/components/product/HomeProducts'

export const dynamic = 'force-dynamic'

interface CategoryLean { _id: unknown; slug: string; name: string }
interface StoreLean { _id: unknown; countryCode: string; countryName: string; storeName?: string; currency: string }

export default async function HomePage() {
  await connectMongo()
  const [categories, stores] = await Promise.all([
    Category.find({ isActive: true }).sort({ order: 1 }).lean<CategoryLean[]>(),
    Store.find({ isActive: true }).sort({ countryName: 1 }).lean<StoreLean[]>()
  ])

  return (
    <>
      <Header />
      <Container className="py-10 space-y-12">
        <section>
          <h1 className="font-display text-4xl md:text-5xl text-navy mb-3">From any store, to any door.</h1>
          <p className="text-base text-text-muted">Shop worldwide. Prices in USD and your local currency.</p>
        </section>

        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-2xl text-navy">Categories</h2>
            <Link href="/categories" className="text-sm text-brand">All categories</Link>
          </div>
          <CategoryGrid categories={categories.map(c => ({ slug: c.slug, name: c.name }))} />
        </section>

        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-2xl text-navy">New arrivals</h2>
            <Link href="/search" className="text-sm text-brand">See all</Link>
          </div>
          <HomeProducts />
        </section>

        <section>
          <h2 className="font-display text-2xl text-navy mb-5">Available stores</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stores.slice(0, 24).map(s => (
              <Link key={String(s._id)} href={`/stores/${s.countryCode}`}
                className="bg-white rounded-xl border border-surface-border p-4 hover:border-brand">
                <div className="text-sm font-medium text-navy">{s.storeName || `${s.countryName} Store`}</div>
                <div className="text-xs text-text-muted mt-1">{s.currency}</div>
              </Link>
            ))}
          </div>
          {stores.length > 24 && (
            <p className="text-xs text-text-muted mt-3">{stores.length - 24} more stores available. Use search to filter.</p>
          )}
        </section>
      </Container>
      <Footer />
    </>
  )
}
