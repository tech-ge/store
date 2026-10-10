import mongoose, { Schema, model, models } from 'mongoose'

export interface ISeller {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  businessName: string
  countryCode: string
  commissionRate: number
  kycStatus: 'pending' | 'approved' | 'rejected'
  payoutMethod?: 'bank' | 'crypto' | 'mobile_money'
  payoutDetails?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

const SellerSchema = new Schema<ISeller>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  businessName: { type: String, required: true },
  countryCode: { type: String, required: true, index: true },
  commissionRate: { type: Number, default: 0.05 },
  kycStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
  payoutMethod: { type: String, enum: ['bank', 'crypto', 'mobile_money'] },
  payoutDetails: { type: Schema.Types.Mixed }
}, { timestamps: true })

export const Seller = models.Seller || model<ISeller>('Seller', SellerSchema)
