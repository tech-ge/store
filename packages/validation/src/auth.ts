import { z } from 'zod'

export const RegisterSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(6).max(20),
  countryCode: z.string().length(2),
  password: z.string().min(8).max(128),
  idNumber: z.string().min(3).max(40),
  idPhotoUrl: z.string().url()
})

export const LoginSchema = z.object({
  email: z.string().email(),
  idNumber: z.string().min(3).max(40),
  password: z.string().min(1).max(128)
})

export const ForgotPasswordSchema = z.object({
  email: z.string().email(),
  idNumber: z.string().min(3).max(40)
})

export const ResetPasswordSchema = z.object({
  token: z.string().min(10),
  newPassword: z.string().min(8).max(128)
})
