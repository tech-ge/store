import { z } from 'zod'

export const CheckoutSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1),
    qty: z.number().int().positive()
  })).min(1),
  destination: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string().optional()
  })
})
