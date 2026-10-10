import mongoose, { Schema, model, models } from 'mongoose'

export interface IStore {
  _id: mongoose.Types.ObjectId
  countryCode: string
  countryName: string
  currency: string
  currencySymbol: string
  cities: { name: string; lat: number; lng: number }[]
  shippingBaseRateUsd: number
  isActive: boolean
  createdBy?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const StoreSchema = new Schema<IStore>({
  countryCode: { type: String, required: true, unique: true, index: true },
  countryName: { type: String, required: true },
  currency: { type: String, required: true },
  currencySymbol: { type: String, required: true },
  cities: [{ name: String, lat: Number, lng: Number, _id: false }],
  shippingBaseRateUsd: { type: Number, default: 5 },
  isActive: { type: Boolean, default: true, index: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true })

export const Store = models.Store || model<IStore>('Store', StoreSchema)
