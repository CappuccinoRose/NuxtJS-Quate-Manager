import type { ResultSetHeader, RowDataPacket } from 'mysql2'

interface FavRow extends RowDataPacket {
  id: number
  is_favorite: number
}

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: '无效语录 ID' })
  }

  const db = useDb()
  const [rows] = await db.execute<FavRow[]>(
    'SELECT id, is_favorite FROM quotes WHERE id = ? AND user_id = ? LIMIT 1',
    [id, user.id],
  )
  const row = rows[0]
  if (!row) {
    throw createError({ statusCode: 404, statusMessage: '语录不存在' })
  }

  const next = row.is_favorite ? 0 : 1
  await db.execute<ResultSetHeader>(
    'UPDATE quotes SET is_favorite = ? WHERE id = ? AND user_id = ?',
    [next, id, user.id],
  )

  return { isFavorite: Boolean(next) }
})
