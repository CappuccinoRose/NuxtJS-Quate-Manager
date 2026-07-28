import type { ThemeMode } from '~/types/models'

/**
 * 演示 useCookie：主题偏好持久化（非 HttpOnly，客户端可读写）
 * 会话 Cookie 由服务端 setCookie，不在此处理
 */
export function useTheme() {
  const themeCookie = useCookie<ThemeMode>('theme', {
    default: () => 'system',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })

  function resolveDark(mode: ThemeMode): boolean {
    if (mode === 'dark') return true
    if (mode === 'light') return false
    if (import.meta.client) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  }

  function applyTheme(mode: ThemeMode = themeCookie.value || 'system') {
    if (!import.meta.client) return
    document.documentElement.classList.toggle('dark', resolveDark(mode))
  }

  function setTheme(mode: ThemeMode) {
    themeCookie.value = mode
    applyTheme(mode)
  }

  return {
    theme: themeCookie,
    setTheme,
    applyTheme,
  }
}
