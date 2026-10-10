import mongoose, { Schema, model, models } from 'mongoose'

export interface INotification {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  channel: 'email' | 'sms' | 'push'
  template: string
  payload?: Record<string, any>
  status: 'queued' | 'sent' | 'failed'
  sentAt?: Date
  error?: string
  createdAt: Date
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  channel: { type: String, enum: ['email', 'sms', 'push'], required: true },
  template: { type: String, required: true },
  payload: { type: Schema.Types.Mixed },
  status: { type: String, enum: ['queued', 'sent', 'failed'], default: 'queued', index: true },
  sentAt: Date,
  error: String
}, { timestamps: { createdAt: true, updatedAt: false } })

export const Notification = models.Notification || model<INotification>('Notification', NotificationSchema)
