import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-[60vh] py-6">{children}</main>
      <Footer />
    </>
  )
}
