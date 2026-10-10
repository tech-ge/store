import Link from 'next/link'

export function CategoryCard({ slug, name }: { slug: string; name: string }) {
  return (
    <Link
      href={`/categories/${slug}`}
      className="block bg-white rounded-xl border border-surface-border p-4 hover:border-brand transition"
    >
      <div className="text-sm font-medium text-navy">{name}</div>
      <div className="mt-2 text-xs text-text-muted capitalize">{slug.replace(/-/g, ' ')}</div>
    </Link>
  )
}
