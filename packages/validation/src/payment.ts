import { z } from 'zod'

export const DepositSchema = z.object({
  amountUsd: z.number().positive(),
  method: z.enum(['card', 'crypto', 'mobile_money']),
  provider: z.string().min(2)
})
