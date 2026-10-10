import mongoose, { Schema, model, models } from 'mongoose'

export interface IShippingQuote {
  _id: mongoose.Types.ObjectId
  orderId?: mongoose.Types.ObjectId
  origin: { lat: number; lng: number }
  destination: { lat: number; lng: number }
  distanceKm: number
  estTimeHours: number
  weightKg: number
  countryFactor: number
  finalFeeUsd: number
  currency: string
  createdAt: Date
}

const ShippingQuoteSchema = new Schema<IShippingQuote>({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', index: true },
  origin: { lat: Number, lng: Number },
  destination: { lat: Number, lng: Number },
  distanceKm: Number,
  estTimeHours: Number,
  weightKg: Number,
  countryFactor: Number,
  finalFeeUsd: Number,
  currency: { type: String, default: 'USD' },
  createdAt: { type: Date, default: Date.now }
})

export const ShippingQuote = models.ShippingQuote || model<IShippingQuote>('ShippingQuote', ShippingQuoteSchema)
