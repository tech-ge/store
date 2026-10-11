import Link from 'next/link'
import { Icon } from '@/components/ui/Icon'

export function CategoryCard({ slug, name }: { slug: string; name: string }) {
  return (
    <Link
      href={`/categories/${slug}`}
      className="group flex min-h-[108px] flex-col justify-between rounded-2xl border border-surface-border bg-white p-4 shadow-[0_4px_18px_rgba(11,31,58,0.03)] transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-card"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm font-semibold text-navy">{name}</div>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-text-muted transition group-hover:bg-brand/10 group-hover:text-brand">
          <Icon name="grid" size={15} />
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 text-xs capitalize text-text-muted">
        <span className="truncate">{slug.replace(/-/g, ' ')}</span>
        <Icon name="arrow" size={14} className="shrink-0 transition group-hover:translate-x-0.5 group-hover:text-brand" />
      </div>
    </Link>
  )
}
