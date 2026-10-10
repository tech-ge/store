import { z } from 'zod'

export const CheckEmailSchema = z.object({ email: z.string().email() })
export const CheckPhoneSchema = z.object({
  phone: z.string().min(6).max(20),
  countryCode: z.string().length(2)
})
export const CheckIdSchema = z.object({
  idNumber: z.string().min(3).max(40),
  countryCode: z.string().length(2)
})

export const ApproveRejectSchema = z.object({
  userId: z.string().min(1),
  action: z.enum(['approve', 'reject']),
  reason: z.string().max(500).optional()
})
