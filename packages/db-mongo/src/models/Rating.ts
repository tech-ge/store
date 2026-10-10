import mongoose, { Schema, model, models } from 'mongoose'

export interface IRating {
  _id: mongoose.Types.ObjectId
  orderId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  productId: mongoose.Types.ObjectId
  sellerId?: mongoose.Types.ObjectId | null
  driverId?: mongoose.Types.ObjectId | null
  productScore: number
  deliveryScore: number
  sellerScore: number
  comment?: string
  createdAt: Date
}

const RatingSchema = new Schema<IRating>({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  sellerId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  driverId: { type: Schema.Types.ObjectId, ref: 'Driver', default: null },
  productScore: { type: Number, min: 1, max: 5 },
  deliveryScore: { type: Number, min: 1, max: 5 },
  sellerScore: { type: Number, min: 1, max: 5 },
  comment: String
}, { timestamps: { createdAt: true, updatedAt: false } })

RatingSchema.index({ orderId: 1, productId: 1, userId: 1 }, { unique: true })

export const Rating = models.Rating || model<IRating>('Rating', RatingSchema)
