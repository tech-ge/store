import mongoose, { Schema, model, models } from 'mongoose'

export interface IUser {
  _id: mongoose.Types.ObjectId
  fullName: string
  email: string
  emailNormalized: string
  passwordHash: string
  idNumberEncrypted: string
  idNumberHash: string
  phone: string
  countryCode: string
  dialCode: string
  role: 'user' | 'seller' | 'admin' | 'driver'
  status: 'pending_kyc' | 'active' | 'rejected' | 'suspended' | 'blocked'
  kycId?: mongoose.Types.ObjectId
  walletId?: mongoose.Types.ObjectId
  defaultStoreId?: mongoose.Types.ObjectId
  lastLoginAt?: Date
  lastLoginIp?: string
  failedLoginCount: number
  lockedUntil?: Date
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  emailNormalized: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  idNumberEncrypted: { type: String, required: true, select: false },
  idNumberHash: { type: String, required: true, select: false },
  phone: { type: String, required: true, unique: true, sparse: true },
  countryCode: { type: String, required: true, index: true },
  dialCode: { type: String, required: true },
  role: { type: String, enum: ['user', 'seller', 'admin', 'driver'], default: 'user', index: true },
  status: {
    type: String,
    enum: ['pending_kyc', 'active', 'rejected', 'suspended', 'blocked'],
    default: 'pending_kyc',
    index: true
  },
  kycId: { type: Schema.Types.ObjectId, ref: 'KycRecord' },
  walletId: { type: Schema.Types.ObjectId, ref: 'Wallet' },
  defaultStoreId: { type: Schema.Types.ObjectId, ref: 'Store' },
  lastLoginAt: Date,
  lastLoginIp: String,
  failedLoginCount: { type: Number, default: 0 },
  lockedUntil: Date
}, { timestamps: true })

UserSchema.index({ idNumberHash: 1, countryCode: 1 }, { unique: true, name: 'id_country_unique' })

export const User = models.User || model<IUser>('User', UserSchema)
