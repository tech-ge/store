import { notFound } from 'next/navigation'
import { connectMongo, Product } from '@dd/db-mongo'
import { Container } from '@/components/layout/Container'
import { Price } from '@/components/price/Price'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import { FavoriteButton } from '@/components/product/FavoriteButton'

export const revalidate = 60

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
  if (!p) p = await Product.findOne({ slug: params.slug }).lean<ProductLean | null>()
  if (!p) notFound()

  const image = p.images?.[0] || '/placeholder.svg'

  return (
    <Container className="py-10">
      <div className="grid md:grid-cols-2 gap-10">
        <div className="aspect-square bg-white rounded-2xl border border-surface-border overflow-hidden">
          <img src={image} alt={p.title} className="w-full h-full object-cover" />
        </div>

        <div className="flex flex-col gap-6">
          <h1 className="font-display text-3xl text-navy leading-tight">{p.title}</h1>
          <Price usd={p.priceUsd} className="text-3xl" />
          <p className="text-base text-text-muted whitespace-pre-line leading-relaxed">{p.description}</p>

          <div className="flex items-center gap-3 mt-2">
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
      </div>
    </Container>
  )
}
