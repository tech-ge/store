import { ProductCard, ProductCardData } from './ProductCard'

export function ProductGrid({ products }: { products: ProductCardData[] }) {
  if (!products.length) {
    return <div className="text-base text-text-muted py-16 text-center">No products found.</div>
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  )
}
