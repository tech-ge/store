import { ReactNode } from 'react'

export function Badge({ children }: { children: ReactNode }) {
  return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-surface-muted text-navy">{children}</span>
}
