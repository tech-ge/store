import mongoose, { Schema, model, models } from 'mongoose'

export interface IOrderItem {
  productId: mongoose.Types.ObjectId
  sellerId?: mongoose.Types.ObjectId | null
  qty: number
  priceUsd: number
  priceLocal: number
  currencyLocal: string
  titleSnapshot: string
  imageSnapshot: string
}

export interface IOrder {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  storeId: mongoose.Types.ObjectId
  items: IOrderItem[]
  pricing: {
    subtotalUsd: number
    subtotalLocal: number
    insuranceUsd: number
    shippingUsd: number
    totalUsd: number
    totalLocal: number
    payNowUsd: number
    payNowLocal: number
    payLaterUsd: number
    payLaterLocal: number
  }
  currencyLocal: string
  fxRateAtCheckout: number
  fxLockedAt: Date
  status:
    | 'pending_payment'
    | 'paid_20'
    | 'assigned_driver'
    | 'out_for_delivery'
    | 'delivered'
    | 'cancelled'
    | 'refunded'
  shippingQuoteId?: mongoose.Types.ObjectId
  deliveryId?: mongoose.Types.ObjectId
  receiptId?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const OrderSchema = new Schema<IOrder>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    sellerId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    qty: { type: Number, required: true },
    priceUsd: { type: Number, required: true },
    priceLocal: { type: Number, required: true },
    currencyLocal: { type: String, required: true },
    titleSnapshot: String,
    imageSnapshot: String,
    _id: false
  }],
  pricing: {
    subtotalUsd: Number,
    subtotalLocal: Number,
    insuranceUsd: Number,
    shippingUsd: Number,
    totalUsd: Number,
    totalLocal: Number,
    payNowUsd: Number,
    payNowLocal: Number,
    payLaterUsd: Number,
    payLaterLocal: Number
  },
  currencyLocal: { type: String, required: true },
  fxRateAtCheckout: { type: Number, required: true },
  fxLockedAt: { type: Date, required: true },
  status: {
    type: String,
    enum: [
      'pending_payment',
      'paid_20',
      'assigned_driver',
      'out_for_delivery',
      'delivered',
      'cancelled',
      'refunded'
    ],
    default: 'pending_payment',
    index: true
  },
  shippingQuoteId: { type: Schema.Types.ObjectId, ref: 'ShippingQuote' },
  deliveryId: { type: Schema.Types.ObjectId, ref: 'Delivery' },
  receiptId: { type: Schema.Types.ObjectId, ref: 'Receipt' }
}, { timestamps: true })

OrderSchema.index({ userId: 1, createdAt: -1 })

export const Order = models.Order || model<IOrder>('Order', OrderSchema)
