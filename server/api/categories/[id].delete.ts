import type { ResultSetHeader, RowDataPacket } from 'mysql2'

interface CategoryRow extends RowDataPacket {
  id: number
  is_system: number
}

interface CountRow extends RowDataPacket {
  cnt: number
}

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: '无效分类 ID' })
  }

  const db = useDb()
  const [found] = await db.execute<CategoryRow[]>(
    'SELECT id, is_system FROM categories WHERE id = ? AND user_id = ? LIMIT 1',
    [id, user.id],
  )
  const cat = found[0]
  if (!cat) {
    throw createError({ statusCode: 404, statusMessage: '分类不存在' })
  }
  if (cat.is_system) {
    throw createError({ statusCode: 400, statusMessage: '系统分类不可删除' })
  }

  const [counts] = await db.execute<CountRow[]>(
    'SELECT COUNT(*) AS cnt FROM quotes WHERE category_id = ? AND user_id = ?',
    [id, user.id],
  )
  if (counts[0]?.cnt > 0) {
    throw createError({ statusCode: 400, statusMessage: '请先迁移或删除该分类下的语录' })
  }

  await db.execute<ResultSetHeader>(
    'DELETE FROM categories WHERE id = ? AND user_id = ?',
    [id, user.id],
  )

  return { ok: true }
})
