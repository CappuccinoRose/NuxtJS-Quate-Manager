import bcrypt from 'bcryptjs'

// 学习项目用 10 轮；生产可调高
const ROUNDS = 10

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, ROUNDS)
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash)
}
