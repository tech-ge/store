import mongoose, { Schema, model, models } from 'mongoose'

export interface IProduct {
  _id: mongoose.Types.ObjectId
  title: string
  slug: string
  description: string
  images: string[]
  categorySlug: string
  storeId: mongoose.Types.ObjectId
  sellerId?: mongoose.Types.ObjectId | null
  addedByAdmin: boolean
  priceUsd: number
  stock: number
  isGlobal: boolean
  ratingAvg: number
  ratingCount: number
  createdAt: Date
  updatedAt: Date
}

const ProductSchema = new Schema<IProduct>({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, index: true },
  description: { type: String, required: true },
  images: [{ type: String }],
  categorySlug: { type: String, required: true, index: true },
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  sellerId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  addedByAdmin: { type: Boolean, default: false },
  priceUsd: { type: Number, required: true, min: 0, index: true },
  stock: { type: Number, default: 0, min: 0 },
  isGlobal: { type: Boolean, default: false, index: true },
  ratingAvg: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 }
}, { timestamps: true })

ProductSchema.index({ slug: 1, storeId: 1 }, { unique: true })
ProductSchema.index({ title: 'text', description: 'text' })

export const Product = models.Product || model<IProduct>('Product', ProductSchema)
