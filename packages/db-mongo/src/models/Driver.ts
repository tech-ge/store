import mongoose, { Schema, model, models } from 'mongoose'

export interface IDriver {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  name: string
  phone: string
  vehicle: string
  countryCode: string
  city: string
  lat: number
  lng: number
  available: boolean
  ratingAvg: number
  ratingCount: number
  createdAt: Date
  updatedAt: Date
}

const DriverSchema = new Schema<IDriver>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  vehicle: String,
  countryCode: { type: String, required: true, index: true },
  city: { type: String, required: true, index: true },
  lat: { type: Number, default: 0, index: true },
  lng: { type: Number, default: 0, index: true },
  available: { type: Boolean, default: true, index: true },
  ratingAvg: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 }
}, { timestamps: true })

export const Driver = models.Driver || model<IDriver>('Driver', DriverSchema)
