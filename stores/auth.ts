import { defineStore } from 'pinia'
import type { UserPublic } from '~/types/models'

/**
 * 演示 Pinia：跨布局持有当前用户；登出走 $fetch
 * 会话 token 在 HttpOnly Cookie 中，这里不存 token
 */
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as UserPublic | null,
    loaded: false,
  }),
  getters: {
    isLoggedIn: (s) => !!s.user,
  },
  actions: {
    async fetchMe() {
      try {
        const data = await $fetch<{ user: UserPublic }>('/api/auth/me')
        this.user = data.user
      } catch {
        this.user = null
      } finally {
        this.loaded = true
      }
    },
    setUser(user: UserPublic | null) {
      this.user = user
      this.loaded = true
    },
    async logout() {
      // 演示 $fetch：写操作 / 事件触发
      await $fetch('/api/auth/logout', { method: 'POST' })
      this.user = null
    },
  },
})
