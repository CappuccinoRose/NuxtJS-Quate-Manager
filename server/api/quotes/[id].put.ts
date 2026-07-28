import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import type { QuoteLanguage } from '~/types/models'

const LANGS: QuoteLanguage[] = ['zh', 'en', 'other']

interface QuoteRow extends RowDataPacket {
  id: number
}

interface CatRow extends RowDataPacket {
  id: number
}

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: '无效语录 ID' })
  }

  const body = await readBody<{
    categoryId?: number
    content?: string
    source?: string
    note?: string
    language?: QuoteLanguage
    isFavorite?: boolean
  }>(event)

  const db = useDb()
  const [found] = await db.execute<QuoteRow[]>(
    'SELECT id FROM quotes WHERE id = ? AND user_id = ? LIMIT 1',
    [id, user.id],
  )
  if (!found.length) {
    throw createError({ statusCode: 404, statusMessage: '语录不存在' })
  }

  const fields: string[] = []
  const params: unknown[] = []

  if (body.content !== undefined) {
    const content = body.content.trim()
    if (!content || content.length > 5000) {
      throw createError({ statusCode: 400, statusMessage: '正文必填且不超过 5000 字' })
    }
    fields.push('content = ?')
    params.push(content)
  }

  if (body.categoryId !== undefined) {
    const categoryId = Number(body.categoryId)
    const [cats] = await db.execute<CatRow[]>(
      'SELECT id FROM categories WHERE id = ? AND user_id = ? LIMIT 1',
      [categoryId, user.id],
    )
    if (!cats.length) {
      throw createError({ statusCode: 400, statusMessage: '分类不存在' })
    }
    fields.push('category_id = ?')
    params.push(categoryId)
  }

  if (body.source !== undefined) {
    const source = body.source.trim() || null
    if (source && source.length > 200) {
      throw createError({ statusCode: 400, statusMessage: '出处不超过 200 字' })
    }
    fields.push('source = ?')
    params.push(source)
  }

  if (body.note !== undefined) {
    const note = body.note.trim() || null
    if (note && note.length > 500) {
      throw createError({ statusCode: 400, statusMessage: '备注不超过 500 字' })
    }
    fields.push('note = ?')
    params.push(note)
  }

  if (body.language !== undefined) {
    if (!LANGS.includes(body.language)) {
      throw createError({ statusCode: 400, statusMessage: '语言取值无效' })
    }
    fields.push('language = ?')
    params.push(body.language)
  }

  if (body.isFavorite !== undefined) {
    fields.push('is_favorite = ?')
    params.push(body.isFavorite ? 1 : 0)
  }

  if (!fields.length) {
    throw createError({ statusCode: 400, statusMessage: '没有可更新的字段' })
  }

  params.push(id, user.id)
  await db.execute<ResultSetHeader>(
    `UPDATE quotes SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
    params,
  )

  return { ok: true }
})
