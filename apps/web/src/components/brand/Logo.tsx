import Link from 'next/link'

export function Logo({ size = 32, compact = false }: { size?: number; compact?: boolean }) {
  return (
    <Link href="/" aria-label="Door Delivery home" className="inline-flex items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="ddLogoGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0B1F3A" />
            <stop offset="100%" stopColor="#FF6A00" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="14" fill="url(#ddLogoGrad)" />
        <rect x="18" y="14" width="28" height="36" rx="4" fill="#FFFFFF" opacity="0.18" />
        <circle cx="40" cy="32" r="2.5" fill="#FFFFFF" />
      </svg>
      <span className={`font-display text-lg tracking-tight ${compact ? 'hidden min-[380px]:inline' : ''}`}>
        <span className="text-navy">Door</span>
        <span className="text-brand">Delivery</span>
      </span>
    </Link>
  )
}
