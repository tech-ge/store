import bcrypt from 'bcryptjs'

const ROUNDS = 12

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, ROUNDS)
}

export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}
