<script setup lang="ts">
import type { Category } from '~/types/models'

definePageMeta({ layout: 'app', middleware: ['auth'] })
useHead({ title: '分类 · 语录手帐' })

// 演示 useFetch：分类列表
const { data, pending, error, refresh } = await useFetch<{ items: Category[] }>('/api/categories', {
  key: 'categories-manage',
})

const newName = ref('')
const formError = ref('')
const loading = ref(false)

async function addCategory() {
  formError.value = ''
  loading.value = true
  try {
    await $fetch('/api/categories', {
      method: 'POST',
      body: { name: newName.value },
    })
    newName.value = ''
    await refresh()
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string }
    formError.value = err?.data?.statusMessage || err?.statusMessage || '添加失败'
  } finally {
    loading.value = false
  }
}

async function rename(cat: Category) {
  const name = prompt('新名称', cat.name)?.trim()
  if (!name || name === cat.name) return
  try {
    await $fetch(`/api/categories/${cat.id}`, {
      method: 'PUT',
      body: { name },
    })
    await refresh()
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string }
    alert(err?.data?.statusMessage || err?.statusMessage || '更新失败')
  }
}

async function remove(cat: Category) {
  if (cat.isSystem) return
  if (!confirm(`删除分类「${cat.name}」？`)) return
  try {
    await $fetch(`/api/categories/${cat.id}`, { method: 'DELETE' })
    await refresh()
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string }
    alert(err?.data?.statusMessage || err?.statusMessage || '删除失败')
  }
}
</script>

<template>
  <div>
    <h1 class="font-serif text-2xl">分类管理</h1>
    <p class="mt-2 text-sm text-[var(--muted)]">系统分类不可删除；仍有语录的分类需先清空</p>

    <form class="mt-6 flex max-w-md gap-2" @submit.prevent="addCategory">
      <input v-model="newName" class="input" placeholder="新分类名称" maxlength="50" required />
      <button type="submit" class="btn-primary shrink-0" :disabled="loading">添加</button>
    </form>
    <p v-if="formError" class="mt-2 text-sm text-red-600">{{ formError }}</p>

    <p v-if="pending" class="mt-8 text-[var(--muted)]">加载中…</p>
    <p v-else-if="error" class="mt-8 text-red-600">加载失败</p>

    <ul v-else class="mt-6 divide-y divide-[var(--border)] border-y border-[var(--border)]">
      <li
        v-for="c in data?.items || []"
        :key="c.id"
        class="flex flex-wrap items-center justify-between gap-2 py-3"
      >
        <div>
          <span>{{ c.name }}</span>
          <span v-if="c.isSystem" class="ml-2 text-xs text-[var(--muted)]">系统</span>
          <span class="ml-2 text-xs text-[var(--muted)]">{{ c.slug }}</span>
        </div>
        <div class="flex gap-2">
          <button type="button" class="btn-ghost px-2 text-xs" @click="rename(c)">改名</button>
          <button
            v-if="!c.isSystem"
            type="button"
            class="btn-danger px-2 text-xs"
            @click="remove(c)"
          >
            删除
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>
