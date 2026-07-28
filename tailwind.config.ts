import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './plugins/**/*.{js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        // 低饱和蓝绿，避免常见 AI 紫系
        accent: {
          DEFAULT: '#2a7a6c',
          soft: '#e6f2ef',
          dark: '#1f5c52',
        },
      },
      fontFamily: {
        sans: [
          '"Source Han Sans SC"',
          '"Noto Sans SC"',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
        serif: [
          '"Source Han Serif SC"',
          '"Noto Serif SC"',
          'Georgia',
          'serif',
        ],
      },
    },
  },
  plugins: [],
} satisfies Config
