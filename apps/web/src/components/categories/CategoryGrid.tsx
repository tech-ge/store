import { CategoryCard } from './CategoryCard'

export function CategoryGrid({ categories }: { categories: { slug: string; name: string }[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {categories.map(c => <CategoryCard key={c.slug} {...c} />)}
    </div>
  )
}
