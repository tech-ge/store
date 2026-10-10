import mongoose, { Schema, model, models } from 'mongoose'

export interface IRate {
  _id: mongoose.Types.ObjectId
  base: string
  rates: Record<string, number>
  source: string
  fetchedAt: Date
}

const RateSchema = new Schema<IRate>({
  base: { type: String, required: true },
  rates: { type: Schema.Types.Mixed, required: true },
  source: { type: String, required: true },
  fetchedAt: { type: Date, default: Date.now, index: true }
})

export const Rate = models.Rate || model<IRate>('Rate', RateSchema)
