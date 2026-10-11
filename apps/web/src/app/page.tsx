import Link from 'next/link'
import { connectMongo, Category, Store } from '@dd/db-mongo'
import { Container } from '@/components/layout/Container'
import { CategoryGrid } from '@/components/categories/CategoryGrid'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { HomeProducts } from '@/components/product/HomeProducts'
import { Icon } from '@/components/ui/Icon'

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
      <Container className="space-y-14 py-6 sm:py-10">
        <section className="cinematic-hero relative isolate overflow-hidden rounded-[2rem] px-6 py-12 text-white shadow-[0_28px_80px_rgba(7,20,40,0.20)] sm:px-10 sm:py-16 lg:min-h-[470px] lg:px-16 lg:py-20">
          <div aria-hidden="true" className="hero-orbit hero-orbit-one" />
          <div aria-hidden="true" className="hero-orbit hero-orbit-two" />
          <div aria-hidden="true" className="hero-glow" />
          <div className="relative z-10 max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-3.5 py-2 text-xs font-semibold tracking-wide text-white/85 backdrop-blur">
              <Icon name="sparkles" size={16} className="text-brand-400" />
              YOUR WORLD, DELIVERED
            </div>
            <h1 className="font-display text-[2.65rem] font-semibold leading-[1.04] tracking-[-0.045em] sm:text-6xl lg:text-[4.4rem]">
              From any store,
              <span className="mt-1 block text-white/65">to any door.</span>
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-7 text-white/70 sm:text-base">
              Discover remarkable finds from around the world. One effortless place to shop, sell and get it delivered.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/search" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-brand-500">
                Explore the collection <Icon name="arrow" size={18} />
              </Link>
              <Link href="/profile/become-seller" className="inline-flex min-h-12 items-center rounded-xl border border-white/20 bg-white/[0.06] px-5 text-sm font-semibold text-white/90 backdrop-blur transition hover:bg-white/[0.12]">
                Open a store
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-white/60 sm:text-sm">
              <span className="inline-flex items-center gap-2"><Icon name="shield" size={16} /> Trusted checkout</span>
              <span className="inline-flex items-center gap-2"><Icon name="bag" size={16} /> Worldwide stores</span>
            </div>
          </div>
          <div aria-hidden="true" className="hero-emblem absolute bottom-10 right-12 hidden h-64 w-64 items-center justify-center rounded-full lg:flex">
            <div className="hero-emblem-ring absolute inset-0 rounded-full" />
            <div className="hero-emblem-core flex h-36 w-36 items-center justify-center rounded-full">
              <Icon name="bag" size={64} className="text-white/90" />
            </div>
            <span className="absolute right-2 top-8 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-medium text-white/80 backdrop-blur">Shop without borders</span>
          </div>
        </section>

        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-brand">Find your next favorite</p>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-navy sm:text-3xl">Shop by category</h2>
            </div>
            <Link href="/categories" className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-navy transition hover:text-brand">All categories <Icon name="arrow" size={16} /></Link>
          </div>
          <CategoryGrid categories={categories.map(c => ({ slug: c.slug, name: c.name }))} />
        </section>

        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-brand">Handpicked for you</p>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-navy sm:text-3xl">New arrivals</h2>
            </div>
            <Link href="/search" className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-navy transition hover:text-brand">Explore all <Icon name="arrow" size={16} /></Link>
          </div>
          <HomeProducts />
        </section>

        <section className="rounded-3xl border border-surface-border bg-white p-5 shadow-card sm:p-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-brand">A world of choice</p>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-navy sm:text-3xl">Stores near & far</h2>
            </div>
            <span className="hidden text-sm text-text-muted sm:inline">{stores.length} destinations</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stores.slice(0, 24).map(s => (
              <Link key={String(s._id)} href={`/stores/${s.countryCode}`}
                className="group flex min-h-[76px] items-center gap-3 rounded-2xl border border-surface-border bg-surface-muted/60 p-4 transition hover:-translate-y-0.5 hover:border-brand/40 hover:bg-white hover:shadow-card">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand shadow-sm"><Icon name="store" size={19} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-navy">{s.storeName || `${s.countryName} Store`}</span>
                  <span className="mt-1 block text-xs text-text-muted">{s.currency}</span>
                </span>
                <Icon name="arrow" size={16} className="shrink-0 text-text-muted transition group-hover:translate-x-0.5 group-hover:text-brand" />
              </Link>
            ))}
          </div>
          {stores.length > 24 && (
            <p className="mt-4 text-xs text-text-muted">{stores.length - 24} more stores available. Use search to filter.</p>
          )}
        </section>
      </Container>
      <Footer />
    </>
  )
}
