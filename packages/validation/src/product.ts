import { z } from 'zod'

export const CreateProductSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().min(5).max(5000),
  images: z.array(z.string().url()).min(1).max(10),
  categorySlug: z.string().min(2),
  storeId: z.string().min(1),
  priceUsd: z.number().positive(),
  stock: z.number().int().nonnegative(),
  isGlobal: z.boolean().optional().default(false)
})
