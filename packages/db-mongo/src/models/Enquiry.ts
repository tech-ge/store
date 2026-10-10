import mongoose, { Schema, model, models } from 'mongoose'

export interface IEnquiry {
  _id: mongoose.Types.ObjectId
  sellerId: mongoose.Types.ObjectId
  buyerId: mongoose.Types.ObjectId
  productId: mongoose.Types.ObjectId
  message: string
  quantity: number
  status: 'open' | 'sold' | 'closed'
  orderId?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const EnquirySchema = new Schema<IEnquiry>({
  sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  message: { type: String, default: '' },
  quantity: { type: Number, default: 1 },
  status: { type: String, enum: ['open', 'sold', 'closed'], default: 'open', index: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order' }
}, { timestamps: true })

export const Enquiry = models.Enquiry || model<IEnquiry>('Enquiry', EnquirySchema)
