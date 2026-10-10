import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Door Delivery',
  description: 'From any store, to any door, worldwide.',
  icons: { icon: '/favicon.svg' }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
