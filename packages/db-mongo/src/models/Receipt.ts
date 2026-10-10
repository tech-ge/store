import mongoose, { Schema, model, models } from 'mongoose'

export interface IReceipt {
  _id: mongoose.Types.ObjectId
  orderId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  pdfUrl?: string
  receiptNumber: string
  parcelPassword: string
  issuedAt: Date
}

const ReceiptSchema = new Schema<IReceipt>({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  pdfUrl: { type: String, default: '' },
  receiptNumber: { type: String, required: true, unique: true, index: true },
  parcelPassword: { type: String, required: true },
  issuedAt: { type: Date, default: Date.now }
})

export const Receipt = models.Receipt || model<IReceipt>('Receipt', ReceiptSchema)
