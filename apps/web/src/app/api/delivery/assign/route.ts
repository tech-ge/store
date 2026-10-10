import { NextResponse } from 'next/server'
import { connectMongo, Delivery, Driver, Order } from '@dd/db-mongo'
import { requireAuth } from '@dd/auth/src/require-auth'
import { requireRole } from '@dd/auth/src/require-role'

export async function POST(req: Request) {
  try {
    const payload = await requireAuth(req)
    requireRole(payload, 'admin')

    const { orderId, driverId } = await req.json()
    if (!orderId || !driverId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    await connectMongo()
    const driver: any = await Driver.findById(driverId).lean()
    if (!driver) return NextResponse.json({ error: 'Driver not found' }, { status: 404 })

    const delivery = await Delivery.findOneAndUpdate(
      { orderId },
      { $set: { driverId: driver._id, driverPhone: driver.phone, status: 'assigned' } },
      { upsert: true, new: true }
    )

    await Order.updateOne({ _id: orderId }, { $set: { status: 'assigned_driver', deliveryId: delivery._id } })
    return NextResponse.json({ delivery })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 401 })
  }
}
