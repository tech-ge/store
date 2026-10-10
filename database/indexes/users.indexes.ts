import { connectMongo, User } from '../../packages/db-mongo/src'

export async function applyUserIndexes() {
  await connectMongo()
  await User.syncIndexes()
  console.log('user indexes applied')
}
