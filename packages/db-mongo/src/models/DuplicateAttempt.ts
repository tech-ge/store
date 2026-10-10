import mongoose, { Schema, model, models } from 'mongoose'

export interface IDuplicateAttempt {
  _id: mongoose.Types.ObjectId
  type: 'email' | 'phone' | 'id_number'
  valueHash: string
  ip: string
  deviceFingerprint: string
  userAgent: string
  countryCode: string
  attemptedAt: Date
}

const DuplicateSchema = new Schema<IDuplicateAttempt>({
  type: { type: String, enum: ['email', 'phone', 'id_number'], required: true, index: true },
  valueHash: { type: String, required: true },
  ip: { type: String, index: true },
  deviceFingerprint: { type: String, index: true },
  userAgent: String,
  countryCode: String,
  attemptedAt: { type: Date, default: Date.now }
})

DuplicateSchema.index({ attemptedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 })

export const DuplicateAttempt = models.DuplicateAttempt || model<IDuplicateAttempt>('DuplicateAttempt', DuplicateSchema)
