import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { connectMongo, Order, Receipt, User } from '@dd/db-mongo'
import { requireAuth } from '@dd/auth/src/require-auth'

function generateReceiptNumber() {
  const ts = Date.now().toString(36).toUpperCase()
  const rnd = crypto.randomBytes(3).toString('hex').toUpperCase()
  return `DD-${ts}-${rnd}`
}

function generateParcelPassword() {
  const digits = crypto.randomInt(100000, 999999)
  return String(digits)
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(req)
    await connectMongo()

    const order: any = await Order.findById(params.id).lean()
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (String(order.userId) !== user.sub && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    let receipt: any = await Receipt.findOne({ orderId: order._id }).lean()
    if (!receipt) {
      const receiptNumber = generateReceiptNumber()
      const parcelPassword = generateParcelPassword()
      receipt = await Receipt.create({
        orderId: order._id,
        userId: order.userId,
        pdfUrl: '',
        receiptNumber,
        parcelPassword,
        issuedAt: new Date()
      })
      await Order.updateOne({ _id: order._id }, { $set: { receiptId: receipt._id } })
    }

    const buyer: any = await User.findById(order.userId).lean()

    return NextResponse.json({
      receipt: {
        receiptNumber: receipt.receiptNumber,
        parcelPassword: receipt.parcelPassword,
        issuedAt: receipt.issuedAt,
        buyerName: buyer?.fullName,
        currency: order.currencyLocal,
        items: order.items,
        pricing: order.pricing,
        status: order.status
      }
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 401 })
  }
}
