// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss'],

  css: ['~/assets/css/main.css'],

  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config.ts',
  },
  // 服务端 MySQL：通过 NUXT_MYSQL_* 环境变量覆盖
  runtimeConfig: {
    mysql: {
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: '',
      database: 'quote_journal',
    },
    // 会话 Cookie 有效期（秒）— 7 天
    sessionMaxAge: 60 * 60 * 24 * 7,
  },

  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      title: '语录手帐',
      meta: [{ name: 'description', content: '个人语录与好句摘抄' }],
    },
  },
})
