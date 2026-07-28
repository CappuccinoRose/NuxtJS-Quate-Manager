import { createError } from 'h3'
import { randomBytes } from 'node:crypto'
import type { RowDataPacket, ResultSetHeader } from 'mysql2'

export const SESSION_COOKIE = 'session_token'

export interface AuthUser {
  id: number
  username: string
  displayName: string | null
}

interface SessionUserRow extends RowDataPacket {
  id: number
  username: string
  display_name: string | null
  session_id: number
}

/** 从 HttpOnly Cookie 解析当前用户；未登录抛 401 */
export async function requireUser(event: Parameters<typeof getCookie>[0]): Promise<AuthUser> {
  const token = getCookie(event, SESSION_COOKIE)
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: '未登录' })
  }

  const db = useDb()
  const [rows] = await db.execute<SessionUserRow[]>(
    `SELECT u.id, u.username, u.display_name, s.id AS session_id
     FROM sessions s
     INNER JOIN users u ON u.id = s.user_id
     WHERE s.token = ? AND s.expires_at > NOW()
     LIMIT 1`,
    [token],
  )

  const row = rows[0]
  if (!row) {
    deleteCookie(event, SESSION_COOKIE, { path: '/' })
    throw createError({ statusCode: 401, statusMessage: '登录已过期' })
  }

  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
  }
}

/** 可选用户：未登录返回 null（用于 guest 中间件配套的 me） */
export async function getOptionalUser(event: Parameters<typeof getCookie>[0]): Promise<AuthUser | null> {
  try {
    return await requireUser(event)
  } catch {
    return null
  }
}

export async function createSession(event: Parameters<typeof setCookie>[0], userId: number) {
  const config = useRuntimeConfig()
  const maxAge = Number(config.sessionMaxAge) || 60 * 60 * 24 * 7
  const token = randomBytes(32).toString('hex')
  const db = useDb()

  // 清理该用户过期会话
  await db.execute('DELETE FROM sessions WHERE user_id = ? AND expires_at <= NOW()', [userId])

  await db.execute<ResultSetHeader>(
    'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? SECOND))',
    [userId, token, maxAge],
  )

  // 会话 Cookie：仅服务端可读（HttpOnly），与主题 useCookie 刻意分开
  setCookie(event, SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge,
    secure: process.env.NODE_ENV === 'production',
  })
}

/** 清除本应用会话（勿与 h3 的 clearSession 混淆） */
export async function clearAuthSession(event: Parameters<typeof getCookie>[0]) {
  const token = getCookie(event, SESSION_COOKIE)
  if (token) {
    const db = useDb()
    await db.execute('DELETE FROM sessions WHERE token = ?', [token])
  }
  deleteCookie(event, SESSION_COOKIE, { path: '/' })
}

/** 注册时写入的默认分类（is_system=1 禁删） */
export const DEFAULT_CATEGORIES = [
  { name: '生活感悟', slug: 'life', sortOrder: 1 },
  { name: '中文好句', slug: 'zh-quote', sortOrder: 2 },
  { name: '英文好句', slug: 'en-quote', sortOrder: 3 },
  { name: '其他', slug: 'other', sortOrder: 99 },
] as const
