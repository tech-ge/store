import mongoose, { Schema, model, models } from 'mongoose'

export interface IAuditLog {
  _id: mongoose.Types.ObjectId
  actorId?: mongoose.Types.ObjectId
  actorRole?: string
  action: string
  resource: string
  resourceId?: string
  ip?: string
  deviceFingerprint?: string
  payload?: Record<string, any>
  hash: string
  prevHash?: string
  createdAt: Date
}

const AuditSchema = new Schema<IAuditLog>({
  actorId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  actorRole: String,
  action: { type: String, required: true, index: true },
  resource: { type: String, required: true, index: true },
  resourceId: { type: String, index: true },
  ip: String,
  deviceFingerprint: String,
  payload: { type: Schema.Types.Mixed },
  hash: { type: String, required: true },
  prevHash: String,
  createdAt: { type: Date, default: Date.now }
})

AuditSchema.index({ createdAt: -1 })

export const AuditLog = models.AuditLog || model<IAuditLog>('AuditLog', AuditSchema)
