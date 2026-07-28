/**
 * 客户端挂载时应用主题，并在 system 模式下监听系统偏好变化
 */
export default defineNuxtPlugin(() => {
  const { theme, applyTheme } = useTheme()
  applyTheme()

  if (import.meta.client) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      if (theme.value === 'system') applyTheme('system')
    }
    mq.addEventListener('change', onChange)
  }
})
