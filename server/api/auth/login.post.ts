import type { RowDataPacket } from 'mysql2'

interface UserRow extends RowDataPacket {
  id: number
  username: string
  password_hash: string
  display_name: string | null
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ username?: string; password?: string }>(event)
  const username = (body.username || '').trim()
  const password = body.password || ''

  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: '请输入用户名和密码' })
  }

  const db = useDb()
  const [rows] = await db.execute<UserRow[]>(
    'SELECT id, username, password_hash, display_name FROM users WHERE username = ? LIMIT 1',
    [username],
  )
  const user = rows[0]
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    throw createError({ statusCode: 401, statusMessage: '用户名或密码错误' })
  }

  await createSession(event, user.id)

  return {
    user: {
      id: user.id,
      username: user.username,
      displayName: user.display_name,
    },
  }
})
