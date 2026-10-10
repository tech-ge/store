import mongoose, { Schema, model, models } from 'mongoose'

export interface ISession {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  deviceFingerprint: string
  userAgent: string
  ip: string
  createdAt: Date
  expiresAt: Date
}

const SessionSchema = new Schema<ISession>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  deviceFingerprint: { type: String, required: true, index: true },
  userAgent: String,
  ip: String,
  expiresAt: { type: Date, required: true }
}, { timestamps: { createdAt: true, updatedAt: false } })

SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const Session = models.Session || model<ISession>('Session', SessionSchema)
