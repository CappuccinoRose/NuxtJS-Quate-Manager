<script setup lang="ts">
import type { Category, QuoteListResponse } from '~/types/models'

definePageMeta({ layout: 'app', middleware: ['auth'] })
useHead({ title: '语录 · 语录手帐' })

const route = useRoute()
const router = useRouter()
const filter = useQuoteFilterStore()

// 从 URL 同步到 Pinia
filter.fromQuery(route.query as Record<string, unknown>)

// 演示 useState：搜索框草稿（点「搜索」前不改 Pinia / URL）
const searchDraft = useState('quotes-search-draft', () => filter.q)

const { data: categoriesData } = await useFetch<{ items: Category[] }>('/api/categories', {
  key: 'categories-for-filter',
})

// 演示 useFetch：列表随筛选响应式刷新
const queryParams = computed(() => filter.toQuery())

const { data, pending, error, refresh } = await useFetch<QuoteListResponse>('/api/quotes', {
  key: 'quotes-list',
  query: queryParams,
  watch: [queryParams],
})

async function applySearch() {
  filter.q = searchDraft.value
  filter.page = 1
  await router.replace({ query: filter.toQuery() })
}

async function setCategory(id: number | null) {
  filter.categoryId = id
  filter.page = 1
  await router.replace({ query: filter.toQuery() })
}

async function toggleFavoriteFilter() {
  filter.favorited = !filter.favorited
  filter.page = 1
  await router.replace({ query: filter.toQuery() })
}

async function goPage(p: number) {
  filter.page = p
  await router.replace({ query: filter.toQuery() })
}

async function toggleFavorite(id: number) {
  // 演示 $fetch：事件触发的写操作
  await $fetch(`/api/quotes/${id}/favorite`, { method: 'PATCH' })
  await refresh()
}

const totalPages = computed(() =>
  data.value ? Math.max(1, Math.ceil(data.value.total / data.value.pageSize)) : 1,
)
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="font-serif text-2xl">语录</h1>
      <NuxtLink to="/app/quotes/new" class="btn-primary">新建</NuxtLink>
    </div>

    <div class="mt-6 flex flex-col gap-3 sm:flex-row">
      <input
        v-model="searchDraft"
        class="input sm:flex-1"
        placeholder="搜索正文或出处…"
        @keyup.enter="applySearch"
      />
      <button type="button" class="btn-ghost" @click="applySearch">搜索</button>
      <button
        type="button"
        class="btn-ghost"
        :class="filter.favorited ? 'border-accent text-accent' : ''"
        @click="toggleFavoriteFilter"
      >
        {{ filter.favorited ? '仅收藏 ✓' : '仅收藏' }}
      </button>
    </div>

    <div class="mt-4 flex flex-wrap gap-2">
      <button
        type="button"
        class="rounded-full border px-3 py-1 text-xs"
        :class="!filter.categoryId ? 'border-accent bg-accent/10 text-accent' : 'border-[var(--border)]'"
        @click="setCategory(null)"
      >
        全部
      </button>
      <button
        v-for="c in categoriesData?.items || []"
        :key="c.id"
        type="button"
        class="rounded-full border px-3 py-1 text-xs"
        :class="
          filter.categoryId === c.id
            ? 'border-accent bg-accent/10 text-accent'
            : 'border-[var(--border)]'
        "
        @click="setCategory(c.id)"
      >
        {{ c.name }}
      </button>
    </div>

    <p v-if="pending" class="mt-8 text-[var(--muted)]">加载中…</p>
    <p v-else-if="error" class="mt-8 text-red-600">加载失败</p>
    <p v-else-if="!data?.items.length" class="mt-8 text-[var(--muted)]">暂无语录</p>

    <ul v-else class="mt-6 divide-y divide-[var(--border)] border-y border-[var(--border)]">
      <li v-for="item in data.items" :key="item.id" class="flex gap-3 py-4">
        <button
          type="button"
          class="shrink-0 text-lg leading-none"
          :title="item.isFavorite ? '取消收藏' : '收藏'"
          @click="toggleFavorite(item.id)"
        >
          {{ item.isFavorite ? '★' : '☆' }}
        </button>
        <div class="min-w-0 flex-1">
          <NuxtLink :to="`/app/quotes/${item.id}`" class="line-clamp-2 hover:text-accent">
            {{ item.content }}
          </NuxtLink>
          <p class="mt-1 text-xs text-[var(--muted)]">
            <span>{{ item.categoryName }}</span>
            <span v-if="item.source"> · {{ item.source }}</span>
            <span> · {{ item.createdAt }}</span>
          </p>
        </div>
        <NuxtLink :to="`/app/quotes/${item.id}/edit`" class="btn-ghost shrink-0 self-start px-2 text-xs">
          编辑
        </NuxtLink>
      </li>
    </ul>

    <div v-if="data && data.total > data.pageSize" class="mt-6 flex items-center justify-center gap-3">
      <button
        type="button"
        class="btn-ghost"
        :disabled="filter.page <= 1"
        @click="goPage(filter.page - 1)"
      >
        上一页
      </button>
      <span class="text-sm text-[var(--muted)]">{{ filter.page }} / {{ totalPages }}</span>
      <button
        type="button"
        class="btn-ghost"
        :disabled="filter.page >= totalPages"
        @click="goPage(filter.page + 1)"
      >
        下一页
      </button>
    </div>
  </div>
</template>
