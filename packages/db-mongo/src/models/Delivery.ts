import mongoose, { Schema, model, models } from 'mongoose'

export interface IDelivery {
  _id: mongoose.Types.ObjectId
  orderId: mongoose.Types.ObjectId
  driverId?: mongoose.Types.ObjectId
  status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed'
  pickup: { lat: number; lng: number; address?: string }
  drop: { lat: number; lng: number; address?: string }
  driverPhone?: string
  lastLat?: number
  lastLng?: number
  lastPingAt?: Date
  proofPhotoUrl?: string
  deliveredAt?: Date
  createdAt: Date
  updatedAt: Date
}

const DeliverySchema = new Schema<IDelivery>({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true, index: true },
  driverId: { type: Schema.Types.ObjectId, ref: 'Driver', index: true },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed'],
    default: 'pending',
    index: true
  },
  pickup: { lat: Number, lng: Number, address: String },
  drop: { lat: Number, lng: Number, address: String },
  driverPhone: String,
  lastLat: Number,
  lastLng: Number,
  lastPingAt: Date,
  proofPhotoUrl: String,
  deliveredAt: Date
}, { timestamps: true })

export const Delivery = models.Delivery || model<IDelivery>('Delivery', DeliverySchema)
