import mongoose from 'mongoose'

declare global {
  // eslint-disable-next-line no-var
  var _mongoose: {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
  } | undefined
}

let cached = global._mongoose
if (!cached) cached = global._mongoose = { conn: null, promise: null }

export async function connectMongo() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not set')

  if (cached!.conn) return cached!.conn
  if (!cached!.promise) {
    cached!.promise = mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
      bufferCommands: false
    })
  }
  cached!.conn = await cached!.promise
  return cached!.conn
}

export async function disconnectMongo() {
  if (cached!.conn) {
    await cached!.conn.disconnect()
    cached!.conn = null
    cached!.promise = null
  }
}
