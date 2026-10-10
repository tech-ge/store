import mongoose, { Schema, model, models } from 'mongoose'

export interface ISellerFee {
  _id: mongoose.Types.ObjectId
  sellerId: mongoose.Types.ObjectId
  productId: mongoose.Types.ObjectId
  orderId: mongoose.Types.ObjectId
  feePercent: number
  feeAmount: number
  currency: string
  status: 'pending' | 'deducted' | 'paid'
  chargedAt: Date
}

const SellerFeeSchema = new Schema<ISellerFee>({
  sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
  feePercent: { type: Number, default: 5 },
  feeAmount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  status: { type: String, enum: ['pending', 'deducted', 'paid'], default: 'pending', index: true },
  chargedAt: { type: Date, default: Date.now }
})

SellerFeeSchema.index({ sellerId: 1, orderId: 1, productId: 1 }, { unique: true })

export const SellerFee = models.SellerFee || model<ISellerFee>('SellerFee', SellerFeeSchema)
