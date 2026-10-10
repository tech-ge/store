import mongoose, { Schema, model, models } from 'mongoose'

export interface IDevice {
  _id: mongoose.Types.ObjectId
  fingerprint: string
  userId?: mongoose.Types.ObjectId
  userAgent: string
  os: string
  ip: string
  firstSeen: Date
  lastSeen: Date
  isBlocked: boolean
  blockReason?: string
  blockedBy?: mongoose.Types.ObjectId
  blockedAt?: Date
}

const DeviceSchema = new Schema<IDevice>({
  fingerprint: { type: String, required: true, unique: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  userAgent: String,
  os: String,
  ip: { type: String, index: true },
  firstSeen: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: Date.now },
  isBlocked: { type: Boolean, default: false, index: true },
  blockReason: String,
  blockedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  blockedAt: Date
})

export const Device = models.Device || model<IDevice>('Device', DeviceSchema)
