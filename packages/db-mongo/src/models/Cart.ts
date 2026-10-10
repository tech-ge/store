import mongoose, { Schema, model, models } from 'mongoose'

export interface ICartItem {
  productId: mongoose.Types.ObjectId
  sellerId?: mongoose.Types.ObjectId | null
  qty: number
  priceUsd: number
  storeId: mongoose.Types.ObjectId
}

export interface ICart {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  items: ICartItem[]
  updatedAt: Date
}

const CartSchema = new Schema<ICart>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    sellerId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    qty: { type: Number, required: true, min: 1 },
    priceUsd: { type: Number, required: true },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
    _id: false
  }]
}, { timestamps: { createdAt: false, updatedAt: true } })

export const Cart = models.Cart || model<ICart>('Cart', CartSchema)
