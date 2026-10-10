import { connectMongo, Product } from '../../packages/db-mongo/src'

export async function applyProductIndexes() {
  await connectMongo()
  await Product.syncIndexes()
  console.log('product indexes applied')
}
