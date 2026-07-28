import type { RowDataPacket } from 'mysql2'

interface CountRow extends RowDataPacket {
  total: number
  favorites: number
}

interface CatCountRow extends RowDataPacket {
  id: number
  name: string
  count: number
}

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const db = useDb()

  const [totals] = await db.execute<CountRow[]>(
    `SELECT
       COUNT(*) AS total,
       SUM(CASE WHEN is_favorite = 1 THEN 1 ELSE 0 END) AS favorites
     FROM quotes
     WHERE user_id = ?`,
    [user.id],
  )

  const [byCategory] = await db.execute<CatCountRow[]>(
    `SELECT c.id, c.name, COUNT(q.id) AS count
     FROM categories c
     LEFT JOIN quotes q ON q.category_id = c.id AND q.user_id = c.user_id
     WHERE c.user_id = ?
     GROUP BY c.id, c.name, c.sort_order
     ORDER BY c.sort_order ASC, c.id ASC`,
    [user.id],
  )

  return {
    total: totals[0]?.total ?? 0,
    favorites: Number(totals[0]?.favorites ?? 0),
    byCategory: byCategory.map((r) => ({
      id: r.id,
      name: r.name,
      count: Number(r.count),
    })),
  }
})
