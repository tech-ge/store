import { ProductCard, ProductCardData } from './ProductCard'

export function ProductGrid({ products }: { products: ProductCardData[] }) {
  if (!products.length) {
    return <div className="text-sm text-text-muted py-10 text-center">No products found.</div>
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  )
}
