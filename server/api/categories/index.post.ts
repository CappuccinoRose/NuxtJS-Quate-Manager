import type { ResultSetHeader, RowDataPacket } from 'mysql2'

interface ExistsRow extends RowDataPacket {
  id: number
}

function toSlug(name: string) {
  // 自定义分类 slug：时间戳 + 简写，避免中文 slug 冲突
  const base = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u4e00-\u9fa5-]/g, '')
    .slice(0, 30)
  return `${base || 'cat'}-${Date.now().toString(36)}`
}

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<{ name?: string; sortOrder?: number }>(event)
  const name = (body.name || '').trim()

  if (!name || name.length > 50) {
    throw createError({ statusCode: 400, statusMessage: '分类名需 1–50 字' })
  }

  const slug = toSlug(name)
  const sortOrder = Number.isFinite(body.sortOrder) ? Number(body.sortOrder) : 50
  const db = useDb()

  const [result] = await db.execute<ResultSetHeader>(
    'INSERT INTO categories (user_id, name, slug, sort_order, is_system) VALUES (?, ?, ?, ?, 0)',
    [user.id, name, slug, sortOrder],
  )

  const [rows] = await db.execute<RowDataPacket[]>(
    'SELECT id, name, slug, sort_order, is_system, created_at FROM categories WHERE id = ? AND user_id = ?',
    [result.insertId, user.id],
  )
  const r = rows[0] as ExistsRow & {
    name: string
    slug: string
    sort_order: number
    is_system: number
    created_at: string
  }

  return {
    item: {
      id: r.id,
      name: r.name,
      slug: r.slug,
      sortOrder: r.sort_order,
      isSystem: Boolean(r.is_system),
      createdAt: r.created_at,
    },
  }
})
