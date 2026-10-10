export interface ProductSummary {
  id: string
  title: string
  slug: string
  image: string
  priceUsd: number
  categorySlug: string
  storeId: string
  sellerId?: string | null
  ratingAvg: number
  ratingCount: number
}
