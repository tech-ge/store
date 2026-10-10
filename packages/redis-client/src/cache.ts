import { redis } from './client'

export async function cacheGet<T>(key: string): Promise<T | null> {
  const v = await redis.get<T>(key)
  return v ?? null
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number) {
  await redis.set(key, value, { ex: ttlSeconds })
}

export async function cacheDel(key: string) {
  await redis.del(key)
}

export async function cacheIncr(key: string, ttlSeconds: number) {
  const count = await redis.incr(key)
  if (count === 1) await redis.expire(key, ttlSeconds)
  return count
}
