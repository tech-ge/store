import mongoose, { Schema, model, models } from 'mongoose'

export interface ITransaction {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  type: 'deposit' | 'order_payment' | 'refund' | 'payout' | 'fee' | 'withdrawal'
  method: 'card' | 'crypto' | 'mobile_money' | 'internal' | 'bank'
  provider: string
  currency: string
  amount: number
  amountUsd: number
  fxRate: number
  status: 'pending' | 'confirmed' | 'failed' | 'refunded'
  providerRef?: string
  metadata?: Record<string, any>
  createdAt: Date
}

const TransactionSchema = new Schema<ITransaction>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['deposit', 'order_payment', 'refund', 'payout', 'fee', 'withdrawal'], required: true, index: true },
  method: { type: String, enum: ['card', 'crypto', 'mobile_money', 'internal', 'bank'], required: true },
  provider: { type: String, required: true },
  currency: { type: String, required: true },
  amount: { type: Number, required: true },
  amountUsd: { type: Number, required: true },
  fxRate: { type: Number, default: 1 },
  status: { type: String, enum: ['pending', 'confirmed', 'failed', 'refunded'], default: 'pending', index: true },
  providerRef: { type: String, index: true, sparse: true, unique: true },
  metadata: { type: Schema.Types.Mixed }
}, { timestamps: { createdAt: true, updatedAt: false } })

TransactionSchema.index({ userId: 1, createdAt: -1 })

export const Transaction = models.Transaction || model<ITransaction>('Transaction', TransactionSchema)
