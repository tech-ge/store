import { connectMongo, Order } from '../../packages/db-mongo/src'

export async function applyOrderIndexes() {
  await connectMongo()
  await Order.syncIndexes()
  console.log('order indexes applied')
}
