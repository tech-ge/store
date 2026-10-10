import { notFound } from 'next/navigation'
import { connectMongo, Category, Product } from '@dd/db-mongo'
import { Container } from '@/components/layout/Container'
import { ProductGrid } from '@/components/product/ProductGrid'

export const dynamic = 'force-dynamic'


interface CategoryLean {
  _id: unknown
  slug: string
  name: string
  isActive: boolean
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

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  await connectMongo()

  const category = await Category
    .findOne({ slug: params.slug })
    .lean<CategoryLean | null>()

  if (!category) notFound()

  const products = await Product
    .find({ categorySlug: params.slug })
    .sort({ createdAt: -1 })
    .limit(60)
    .lean<ProductLean[]>()

  return (
    <Container className="py-8">
      <h1 className="font-display text-2xl text-navy mb-6">{category.name}</h1>
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
