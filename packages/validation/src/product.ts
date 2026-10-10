import { z } from 'zod'

const imageField = z.string().refine(v =>
  v.startsWith('data:image/') || /^https?:\/\//.test(v),
  { message: 'Must be an image URL or a data URL' }
)

export const CreateProductSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().min(5).max(8000),
  images: z.array(imageField).min(1).max(10),
  categorySlug: z.string().min(2),
  storeId: z.string().min(1).optional(),
  storeCountry: z.string().length(2).optional(),
  priceUsd: z.number().positive(),
  stock: z.number().int().nonnegative(),
  isGlobal: z.boolean().optional().default(false)
}).refine(d => d.storeId || d.storeCountry, { message: 'storeId or storeCountry required' })
