import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import type { QuoteLanguage } from '~/types/models'

const LANGS: QuoteLanguage[] = ['zh', 'en', 'other']

interface CatRow extends RowDataPacket {
  id: number
}

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<{
    categoryId?: number
    content?: string
    source?: string
    note?: string
    language?: QuoteLanguage
    isFavorite?: boolean
  }>(event)

  const content = (body.content || '').trim()
  if (!content || content.length > 5000) {
    throw createError({ statusCode: 400, statusMessage: '正文必填且不超过 5000 字' })
  }

  const categoryId = Number(body.categoryId)
  if (!Number.isFinite(categoryId)) {
    throw createError({ statusCode: 400, statusMessage: '请选择分类' })
  }

  const source = body.source?.trim() || null
  const note = body.note?.trim() || null
  if (source && source.length > 200) {
    throw createError({ statusCode: 400, statusMessage: '出处不超过 200 字' })
  }
  if (note && note.length > 500) {
    throw createError({ statusCode: 400, statusMessage: '备注不超过 500 字' })
  }

  const language: QuoteLanguage = LANGS.includes(body.language as QuoteLanguage)
    ? (body.language as QuoteLanguage)
    : 'zh'
  const isFavorite = body.isFavorite ? 1 : 0

  const db = useDb()
  const [cats] = await db.execute<CatRow[]>(
    'SELECT id FROM categories WHERE id = ? AND user_id = ? LIMIT 1',
    [categoryId, user.id],
  )
  if (!cats.length) {
    throw createError({ statusCode: 400, statusMessage: '分类不存在' })
  }

  const [result] = await db.execute<ResultSetHeader>(
    `INSERT INTO quotes (user_id, category_id, content, source, note, language, is_favorite)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [user.id, categoryId, content, source, note, language, isFavorite],
  )

  return { id: result.insertId }
})
