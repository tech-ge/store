import mongoose, { Schema, model, models } from 'mongoose'

export interface IKycRecord {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  idNumberEncrypted: string
  idNumberNormalized: string
  idNumberHash: string
  idPhotoUrl: string
  countryCode: string
  status: 'pending' | 'approved' | 'rejected'
  reviewedBy?: mongoose.Types.ObjectId
  reviewedAt?: Date
  rejectionReason?: string
  adminNotes?: string
  submittedAt: Date
}

const KycSchema = new Schema<IKycRecord>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  idNumberEncrypted: { type: String, required: true },
  idNumberNormalized: { type: String, required: true },
  idNumberHash: { type: String, required: true },
  idPhotoUrl: { type: String, required: true },
  countryCode: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
  rejectionReason: String,
  adminNotes: String,
  submittedAt: { type: Date, default: Date.now }
})

KycSchema.index({ idNumberHash: 1, countryCode: 1 }, { unique: true, name: 'kyc_id_country_unique' })
KycSchema.index({ status: 1, submittedAt: -1 })

export const KycRecord = models.KycRecord || model<IKycRecord>('KycRecord', KycSchema)
