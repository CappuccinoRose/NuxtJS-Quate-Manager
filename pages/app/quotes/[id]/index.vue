<script setup lang="ts">
import type { Quote } from '~/types/models'

definePageMeta({ layout: 'app', middleware: ['auth'] })

const route = useRoute()
const id = computed(() => String(route.params.id))

// 演示 useAsyncData：详情页按 id 拉取（与列表的 useFetch 对照）
const { data, pending, error, refresh } = await useAsyncData(
  () => `quote-${id.value}`,
  () => $fetch<{ item: Quote }>(`/api/quotes/${id.value}`),
  { watch: [id] },
)

const item = computed(() => data.value?.item)

// 演示 useHead：详情 SEO，用语录摘要作 title/description
useHead({
  title: computed(() => {
    const text = item.value?.content || ''
    if (!text) return '语录详情 · 语录手帐'
    const summary = text.length > 40 ? `${text.slice(0, 40)}…` : text
    return `${summary} · 语录手帐`
  }),
  meta: computed(() => [
    {
      name: 'description',
      content: (item.value?.content || '语录详情').slice(0, 120),
    },
  ]),
})
const busy = ref(false)

async function toggleFavorite() {
  if (!item.value) return
  busy.value = true
  try {
    await $fetch(`/api/quotes/${item.value.id}/favorite`, { method: 'PATCH' })
    await refresh()
  } finally {
    busy.value = false
  }
}

async function onDelete() {
  if (!item.value || !confirm('确定删除这条语录？')) return
  await $fetch(`/api/quotes/${item.value.id}`, { method: 'DELETE' })
  await navigateTo('/app/quotes')
}
</script>

<template>
  <div>
    <p v-if="pending" class="text-[var(--muted)]">加载中…</p>
    <p v-else-if="error" class="text-red-600">加载失败或不存在</p>

    <template v-else-if="item">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p class="text-sm text-[var(--muted)]">
            {{ item.categoryName }}
            <span v-if="item.source"> · {{ item.source }}</span>
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button type="button" class="btn-ghost" :disabled="busy" @click="toggleFavorite">
            {{ item.isFavorite ? '★ 已收藏' : '☆ 收藏' }}
          </button>
          <NuxtLink :to="`/app/quotes/${item.id}/edit`" class="btn-ghost">编辑</NuxtLink>
          <button type="button" class="btn-danger" @click="onDelete">删除</button>
        </div>
      </div>

      <blockquote class="mt-8 whitespace-pre-wrap font-serif text-xl leading-relaxed">
        {{ item.content }}
      </blockquote>

      <p v-if="item.note" class="mt-6 text-sm text-[var(--muted)]">备注：{{ item.note }}</p>
      <p class="mt-4 text-xs text-[var(--muted)]">
        语言 {{ item.language }} · 更新于 {{ item.updatedAt }}
      </p>

      <NuxtLink to="/app/quotes" class="btn-ghost mt-8 inline-flex">← 返回列表</NuxtLink>
    </template>
  </div>
</template>
