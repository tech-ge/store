import mongoose, { Schema, model, models } from 'mongoose'

export interface IFraudEvent {
  _id: mongoose.Types.ObjectId
  userId?: mongoose.Types.ObjectId
  deviceId?: mongoose.Types.ObjectId
  ip?: string
  rule: string
  severity: 'low' | 'medium' | 'high'
  payload?: Record<string, any>
  createdAt: Date
}

const FraudSchema = new Schema<IFraudEvent>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  deviceId: { type: Schema.Types.ObjectId, ref: 'Device', index: true },
  ip: { type: String, index: true },
  rule: { type: String, required: true, index: true },
  severity: { type: String, enum: ['low', 'medium', 'high'], default: 'low', index: true },
  payload: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
})

FraudSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 180 })

export const FraudEvent = models.FraudEvent || model<IFraudEvent>('FraudEvent', FraudSchema)
