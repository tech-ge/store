import mongoose, { Schema, model, models } from 'mongoose'

export interface ICryptoAddress {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  network: 'BTC' | 'ERC20' | 'TRC20' | 'BEP20' | 'SOL'
  asset: string
  address: string
  privateKeyEncrypted: string
  derivationPath?: string
  createdAt: Date
}

const CryptoAddressSchema = new Schema<ICryptoAddress>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  network: { type: String, required: true, index: true },
  asset: { type: String, required: true },
  address: { type: String, required: true, unique: true, index: true },
  privateKeyEncrypted: { type: String, required: true, select: false },
  derivationPath: String
}, { timestamps: { createdAt: true, updatedAt: false } })

export const CryptoAddress = models.CryptoAddress || model<ICryptoAddress>('CryptoAddress', CryptoAddressSchema)
