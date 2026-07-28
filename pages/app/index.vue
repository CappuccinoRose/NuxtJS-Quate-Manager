<script setup lang="ts">
import type { StatsResponse } from '~/types/models'

definePageMeta({ layout: 'app', middleware: ['auth'] })

// 演示 useHead
useHead({ title: '仪表盘 · 语录手帐' })

// 演示 useAsyncData：仪表盘统计（首屏一次拉取）
const { data, pending, error, refresh } = await useAsyncData('dashboard-stats', () =>
  $fetch<StatsResponse>('/api/stats'),
)
</script>

<template>
  <div>
    <div class="flex items-center justify-between gap-3">
      <h1 class="font-serif text-2xl">仪表盘</h1>
      <button type="button" class="btn-ghost" @click="refresh()">刷新</button>
    </div>

    <p v-if="pending" class="mt-6 text-[var(--muted)]">加载中…</p>
    <p v-else-if="error" class="mt-6 text-red-600">加载失败</p>

    <template v-else-if="data">
      <div class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <p class="text-sm text-[var(--muted)]">语录总数</p>
          <p class="mt-1 text-3xl font-medium">{{ data.total }}</p>
        </div>
        <div class="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <p class="text-sm text-[var(--muted)]">收藏</p>
          <p class="mt-1 text-3xl font-medium">{{ data.favorites }}</p>
        </div>
      </div>

      <h2 class="mt-10 text-sm font-medium text-[var(--muted)]">按分类</h2>
      <ul class="mt-3 divide-y divide-[var(--border)] border-y border-[var(--border)]">
        <li
          v-for="c in data.byCategory"
          :key="c.id"
          class="flex items-center justify-between py-3 text-sm"
        >
          <span>{{ c.name }}</span>
          <span class="text-[var(--muted)]">{{ c.count }}</span>
        </li>
      </ul>

      <div class="mt-8">
        <NuxtLink to="/app/quotes/new" class="btn-primary">写一条语录</NuxtLink>
      </div>
    </template>
  </div>
</template>
