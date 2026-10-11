import { ReactNode } from 'react'

export function Badge({ children }: { children: ReactNode }) {
  return <span className="inline-flex items-center rounded-full border border-navy/5 bg-surface-muted px-2.5 py-1 text-xs font-semibold text-navy">{children}</span>
}
