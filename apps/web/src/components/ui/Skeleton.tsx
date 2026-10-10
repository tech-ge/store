export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-surface-muted rounded-xl ${className}`} />
}
