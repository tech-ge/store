import mongoose, { Schema, model, models } from 'mongoose'

export interface ILoginAttempt {
  _id: mongoose.Types.ObjectId
  email: string
  idNumberHash?: string
  ip: string
  deviceFingerprint: string
  userAgent: string
  success: boolean
  reason: string
  at: Date
}

const LoginAttemptSchema = new Schema<ILoginAttempt>({
  email: { type: String, index: true },
  idNumberHash: String,
  ip: { type: String, index: true },
  deviceFingerprint: { type: String, index: true },
  userAgent: String,
  success: Boolean,
  reason: String,
  at: { type: Date, default: Date.now }
})

LoginAttemptSchema.index({ at: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 })

export const LoginAttempt = models.LoginAttempt || model<ILoginAttempt>('LoginAttempt', LoginAttemptSchema)
