/** 前后端共享的领域类型 */

export type QuoteLanguage = 'zh' | 'en' | 'other'

export interface UserPublic {
  id: number
  username: string
  displayName: string | null
}

export interface Category {
  id: number
  name: string
  slug: string
  sortOrder: number
  isSystem: boolean
  createdAt: string
}

export interface Quote {
  id: number
  categoryId: number
  categoryName?: string
  content: string
  source: string | null
  note: string | null
  language: QuoteLanguage
  isFavorite: boolean
  createdAt: string
  updatedAt: string
}

export interface QuoteListResponse {
  items: Quote[]
  total: number
  page: number
  pageSize: number
}

export interface StatsResponse {
  total: number
  favorites: number
  byCategory: Array<{ id: number; name: string; count: number }>
}

export type ThemeMode = 'system' | 'light' | 'dark'
