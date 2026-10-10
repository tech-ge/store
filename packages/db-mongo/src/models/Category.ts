import mongoose, { Schema, model, models } from 'mongoose'

export interface ICategory {
  _id: mongoose.Types.ObjectId
  slug: string
  name: string
  parentSlug?: string
  isActive: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}

const CategorySchema = new Schema<ICategory>({
  slug: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  parentSlug: { type: String, index: true },
  isActive: { type: Boolean, default: true, index: true },
  order: { type: Number, default: 0 }
}, { timestamps: true })

export const Category = models.Category || model<ICategory>('Category', CategorySchema)
