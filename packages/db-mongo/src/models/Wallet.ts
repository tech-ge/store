import mongoose, { Schema, model, models } from 'mongoose'

export interface IWallet {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  balances: Record<string, number>
  locked: Record<string, number>
  updatedAt: Date
}

const WalletSchema = new Schema<IWallet>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  balances: {
    type: Schema.Types.Mixed,
    default: () => ({ USD: 0 })
  },
  locked: {
    type: Schema.Types.Mixed,
    default: () => ({ USD: 0 })
  }
}, { timestamps: { createdAt: false, updatedAt: true } })

export const Wallet = models.Wallet || model<IWallet>('Wallet', WalletSchema)
