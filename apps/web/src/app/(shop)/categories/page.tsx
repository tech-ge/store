import Link from 'next/link'
import { connectMongo, Category } from '@dd/db-mongo'
import { Container } from '@/components/layout/Container'

export const dynamic = 'force-dynamic'


interface CategoryLean {
  _id: unknown
  slug: string
  name: string
}

export default async function CategoriesPage() {
  await connectMongo()
  const categories = await Category.find({ isActive: true }).sort({ order: 1 }).lean<CategoryLean[]>()
  return (
    <Container className="py-8">
      <h1 className="font-display text-2xl text-navy mb-6">All categories</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {categories.map(c => (
          <Link key={c.slug} href={`/categories/${c.slug}`} className="bg-white rounded-xl border border-surface-border p-4 hover:border-brand">
            <div className="text-sm font-medium text-navy">{c.name}</div>
          </Link>
        ))}
      </div>
    </Container>
  )
}
