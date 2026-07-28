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

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: '无效语录 ID' })
  }

  const db = useDb()
  const [rows] = await db.execute<QuoteRow[]>(
    `SELECT q.id, q.category_id, c.name AS category_name, q.content, q.source, q.note,
            q.language, q.is_favorite, q.created_at, q.updated_at
     FROM quotes q
     INNER JOIN categories c ON c.id = q.category_id
     WHERE q.id = ? AND q.user_id = ?
     LIMIT 1`,
    [id, user.id],
  )
  const r = rows[0]
  if (!r) {
    throw createError({ statusCode: 404, statusMessage: '语录不存在' })
  }

  return {
    item: {
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
    },
  }
})
