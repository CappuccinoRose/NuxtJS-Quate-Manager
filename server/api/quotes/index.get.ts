import type { RowDataPacket } from 'mysql2'
import type { QuoteLanguage } from '~/types/models'

interface QuoteRow extends RowDataPacket {
  id: number
  category_id: number
  category_name: string
  content: string
  source: string | null
  note: string | null
  language: QuoteLanguage
  is_favorite: number
  created_at: string
  updated_at: string
}

interface CountRow extends RowDataPacket {
  total: number
}

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const query = getQuery(event)

  const page = Math.max(1, Number(query.page) || 1)
  const pageSize = Math.min(50, Math.max(1, Number(query.pageSize) || 20))
  const offset = (page - 1) * pageSize

  const categoryId = query.categoryId ? Number(query.categoryId) : null
  const q = typeof query.q === 'string' ? query.q.trim() : ''
  const favorited = query.favorited === '1' || query.favorited === 'true'

  const where: string[] = ['q.user_id = ?']
  const params: unknown[] = [user.id]

  if (categoryId && Number.isFinite(categoryId)) {
    where.push('q.category_id = ?')
    params.push(categoryId)
  }
  if (favorited) {
    where.push('q.is_favorite = 1')
  }
  if (q) {
    where.push('(q.content LIKE ? OR IFNULL(q.source, "") LIKE ?)')
    const like = `%${q}%`
    params.push(like, like)
  }

  const whereSql = where.join(' AND ')
  const db = useDb()

  const [countRows] = await db.execute<CountRow[]>(
    `SELECT COUNT(*) AS total FROM quotes q WHERE ${whereSql}`,
    params,
  )
  const total = countRows[0]?.total ?? 0

  // LIMIT/OFFSET 用数字插入（已校验为整数），其余条件参数化
  const [rows] = await db.execute<QuoteRow[]>(
    `SELECT q.id, q.category_id, c.name AS category_name, q.content, q.source, q.note,
            q.language, q.is_favorite, q.created_at, q.updated_at
     FROM quotes q
     INNER JOIN categories c ON c.id = q.category_id
     WHERE ${whereSql}
     ORDER BY q.created_at DESC, q.id DESC
     LIMIT ${pageSize} OFFSET ${offset}`,
    params,
  )

  return {
    items: rows.map((r) => ({
      id: r.id,
      categoryId: r.category_id,
      categoryName: r.category_name,
      content: r.content,
      source: r.source,
      note: r.note,
      language: r.language,
      isFavorite: Boolean(r.is_favorite),
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    })),
    total,
    page,
    pageSize,
  }
})
