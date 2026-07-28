import type { RowDataPacket } from 'mysql2'

interface CategoryRow extends RowDataPacket {
  id: number
  name: string
  slug: string
  sort_order: number
  is_system: number
  created_at: string
}

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const db = useDb()
  const [rows] = await db.execute<CategoryRow[]>(
    `SELECT id, name, slug, sort_order, is_system, created_at
     FROM categories
     WHERE user_id = ?
     ORDER BY sort_order ASC, id ASC`,
    [user.id],
  )

  return {
    items: rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      sortOrder: r.sort_order,
      isSystem: Boolean(r.is_system),
      createdAt: r.created_at,
    })),
  }
})
