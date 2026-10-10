import mongoose, { Schema, model, models } from 'mongoose'

export interface IInsurancePolicy {
  _id: mongoose.Types.ObjectId
  orderId: mongoose.Types.ObjectId
  coverageUsd: number
  premiumUsd: number
  status: 'active' | 'claimed' | 'expired'
  createdAt: Date
}

const InsuranceSchema = new Schema<IInsurancePolicy>({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true, index: true },
  coverageUsd: Number,
  premiumUsd: Number,
  status: { type: String, enum: ['active', 'claimed', 'expired'], default: 'active', index: true }
}, { timestamps: { createdAt: true, updatedAt: false } })

export const InsurancePolicy = models.InsurancePolicy || model<IInsurancePolicy>('InsurancePolicy', InsuranceSchema)
