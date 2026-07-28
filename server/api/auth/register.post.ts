import type { ResultSetHeader, RowDataPacket } from 'mysql2'

interface ExistsRow extends RowDataPacket {
  id: number
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    username?: string
    password?: string
    displayName?: string
  }>(event)

  const username = (body.username || '').trim()
  const password = body.password || ''
  const displayName = (body.displayName || username).trim() || username

  if (!/^[a-zA-Z0-9_]{3,50}$/.test(username)) {
    throw createError({
      statusCode: 400,
      statusMessage: '用户名需 3–50 位字母、数字或下划线',
    })
  }
  if (password.length < 6) {
    throw createError({ statusCode: 400, statusMessage: '密码至少 6 位' })
  }

  const db = useDb()
  const [exists] = await db.execute<ExistsRow[]>(
    'SELECT id FROM users WHERE username = ? LIMIT 1',
    [username],
  )
  if (exists.length) {
    throw createError({ statusCode: 409, statusMessage: '用户名已存在' })
  }

  const passwordHash = await hashPassword(password)
  const conn = await db.getConnection()

  try {
    await conn.beginTransaction()

    const [result] = await conn.execute<ResultSetHeader>(
      'INSERT INTO users (username, password_hash, display_name) VALUES (?, ?, ?)',
      [username, passwordHash, displayName],
    )
    const userId = result.insertId

    for (const cat of DEFAULT_CATEGORIES) {
      await conn.execute(
        'INSERT INTO categories (user_id, name, slug, sort_order, is_system) VALUES (?, ?, ?, ?, 1)',
        [userId, cat.name, cat.slug, cat.sortOrder],
      )
    }

    await conn.commit()
    await createSession(event, userId)

    return {
      user: { id: userId, username, displayName },
    }
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
})
