<script setup lang="ts">
import type { ThemeMode } from '~/types/models'

/** 主题三段切换：跟随系统 / 浅色 / 深色 */
const { theme, setTheme } = useTheme()

const modes: Array<{ value: ThemeMode; label: string }> = [
  { value: 'system', label: '系统' },
  { value: 'light', label: '浅' },
  { value: 'dark', label: '深' },
]
</script>

<template>
  <div
    class="inline-flex rounded-md border border-[var(--border)] p-0.5 text-xs"
    role="group"
    aria-label="主题"
  >
    <button
      v-for="m in modes"
      :key="m.value"
      type="button"
      class="rounded px-2 py-1 transition"
      :class="
        theme === m.value
          ? 'bg-accent text-white dark:text-zinc-900'
          : 'text-[var(--muted)] hover:text-[var(--fg)]'
      "
      @click="setTheme(m.value)"
    >
      {{ m.label }}
    </button>
  </div>
</template>
