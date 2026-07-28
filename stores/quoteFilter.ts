import { defineStore } from 'pinia'

/**
 * 演示 Pinia：筛选条件跨页保持，并同步到 URL query
 * （侧边栏折叠等临时 UI 用 useState，不放这里）
 */
export const useQuoteFilterStore = defineStore('quoteFilter', {
  state: () => ({
    categoryId: null as number | null,
    q: '',
    favorited: false,
    page: 1,
    pageSize: 20,
  }),
  actions: {
    fromQuery(query: Record<string, unknown>) {
      this.categoryId = query.categoryId ? Number(query.categoryId) : null
      this.q = typeof query.q === 'string' ? query.q : ''
      this.favorited = query.favorited === '1' || query.favorited === true
      this.page = Math.max(1, Number(query.page) || 1)
      this.pageSize = Math.min(50, Math.max(1, Number(query.pageSize) || 20))
    },
    toQuery() {
      const q: Record<string, string> = {}
      if (this.categoryId) q.categoryId = String(this.categoryId)
      if (this.q.trim()) q.q = this.q.trim()
      if (this.favorited) q.favorited = '1'
      if (this.page > 1) q.page = String(this.page)
      if (this.pageSize !== 20) q.pageSize = String(this.pageSize)
      return q
    },
    reset() {
      this.categoryId = null
      this.q = ''
      this.favorited = false
      this.page = 1
    },
  },
})
