import type { ResultSetHeader, RowDataPacket } from 'mysql2'

interface QuoteRow extends RowDataPacket {
  id: number
}

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: '无效语录 ID' })
  }

  const db = useDb()
  const [found] = await db.execute<QuoteRow[]>(
    'SELECT id FROM quotes WHERE id = ? AND user_id = ? LIMIT 1',
    [id, user.id],
  )
  if (!found.length) {
    throw createError({ statusCode: 404, statusMessage: '语录不存在' })
  }

  await db.execute<ResultSetHeader>(
    'DELETE FROM quotes WHERE id = ? AND user_id = ?',
    [id, user.id],
  )

  return { ok: true }
})
