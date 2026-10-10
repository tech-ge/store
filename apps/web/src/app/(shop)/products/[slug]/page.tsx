import { notFound } from 'next/navigation'
import { connectMongo, Product } from '@dd/db-mongo'
import { Container } from '@/components/layout/Container'
import { Price } from '@/components/price/Price'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import { FavoriteButton } from '@/components/product/FavoriteButton'

export const dynamic = 'force-dynamic'


interface ProductLean {
  _id: unknown
  title: string
  slug?: string
  description: string
  images?: string[]
  priceUsd: number
  storeId: unknown
  sellerId?: unknown | null
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  await connectMongo()

  let p = await Product.findById(params.slug).lean<ProductLean | null>().catch(() => null)
  if (!p) {
    p = await Product.findOne({ slug: params.slug }).lean<ProductLean | null>()
  }
  if (!p) notFound()

  const image = p.images?.[0] || ''

  return (
    <Container className="py-8 grid md:grid-cols-2 gap-8">
      <div className="aspect-square bg-white rounded-2xl border border-surface-border overflow-hidden">
        {image ? <img src={image} alt={p.title} className="w-full h-full object-cover" /> : null}
      </div>
      <div>
        <h1 className="font-display text-2xl text-navy">{p.title}</h1>
        <div className="mt-3">
          <Price usd={p.priceUsd} className="text-xl" />
        </div>
        <p className="mt-4 text-text-muted whitespace-pre-line">{p.description}</p>
        <div className="mt-6 flex items-center gap-3">
          <AddToCartButton
            product={{
              id: String(p._id),
              productId: String(p._id),
              title: p.title,
              image,
              price: p.priceUsd,
              currency: 'USD',
              qty: 1,
              storeId: String(p.storeId),
              sellerId: p.sellerId ? String(p.sellerId) : undefined
            }}
          />
          <FavoriteButton product={{
            productId: String(p._id),
            title: p.title,
            image,
            price: p.priceUsd,
            currency: 'USD'
          }} />
        </div>
      </div>
    </Container>
  )
}
