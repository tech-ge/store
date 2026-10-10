import mongoose, { Schema, model, models } from 'mongoose'

export interface ICountryCurrency {
  _id: mongoose.Types.ObjectId
  countryCode: string
  countryName: string
  dialCode: string
  currency: string
  currencySymbol: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const CCSchema = new Schema<ICountryCurrency>({
  countryCode: { type: String, required: true, unique: true, index: true },
  countryName: { type: String, required: true },
  dialCode: { type: String, required: true },
  currency: { type: String, required: true },
  currencySymbol: { type: String, required: true },
  isActive: { type: Boolean, default: true, index: true }
}, { timestamps: true })

export const CountryCurrency = models.CountryCurrency || model<ICountryCurrency>('CountryCurrency', CCSchema)
