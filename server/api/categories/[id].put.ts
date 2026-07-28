import type { ResultSetHeader, RowDataPacket } from 'mysql2'

interface CategoryRow extends RowDataPacket {
  id: number
  is_system: number
}

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: '无效分类 ID' })
  }

  const body = await readBody<{ name?: string; sortOrder?: number }>(event)
  const name = body.name !== undefined ? body.name.trim() : undefined
  if (name !== undefined && (!name || name.length > 50)) {
    throw createError({ statusCode: 400, statusMessage: '分类名需 1–50 字' })
  }

  const db = useDb()
  const [found] = await db.execute<CategoryRow[]>(
    'SELECT id, is_system FROM categories WHERE id = ? AND user_id = ? LIMIT 1',
    [id, user.id],
  )
  if (!found.length) {
    throw createError({ statusCode: 404, statusMessage: '分类不存在' })
  }

  const fields: string[] = []
  const params: unknown[] = []
  if (name !== undefined) {
    fields.push('name = ?')
    params.push(name)
  }
  if (body.sortOrder !== undefined && Number.isFinite(body.sortOrder)) {
    fields.push('sort_order = ?')
    params.push(Number(body.sortOrder))
  }
  if (!fields.length) {
    throw createError({ statusCode: 400, statusMessage: '没有可更新的字段' })
  }

  params.push(id, user.id)
  await db.execute<ResultSetHeader>(
    `UPDATE categories SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
    params,
  )

  return { ok: true }
})
