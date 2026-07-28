/**
 * 挂在 login/register：已登录则进应用
 */
export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuthStore()
  if (!auth.loaded) {
    await auth.fetchMe()
  }
  if (auth.isLoggedIn) {
    return navigateTo('/app')
  }
})
