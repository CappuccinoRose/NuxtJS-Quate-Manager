<script setup lang="ts">
import type { Category, QuoteLanguage } from '~/types/models'

definePageMeta({ layout: 'app', middleware: ['auth'] })
useHead({ title: '新建语录 · 语录手帐' })

const { data: categoriesData } = await useFetch<{ items: Category[] }>('/api/categories')

const form = reactive({
  categoryId: null as number | null,
  content: '',
  source: '',
  note: '',
  language: 'zh' as QuoteLanguage,
  isFavorite: false,
})

watchEffect(() => {
  if (!form.categoryId && categoriesData.value?.items?.length) {
    form.categoryId = categoriesData.value.items[0].id
  }
})

const error = ref('')
const loading = ref(false)

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    const res = await $fetch<{ id: number }>('/api/quotes', {
      method: 'POST',
      body: {
        categoryId: form.categoryId,
        content: form.content,
        source: form.source,
        note: form.note,
        language: form.language,
        isFavorite: form.isFavorite,
      },
    })
    await navigateTo(`/app/quotes/${res.id}`)
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string }
    error.value = err?.data?.statusMessage || err?.statusMessage || '保存失败'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <h1 class="font-serif text-2xl">新建语录</h1>
    <form class="mt-6 max-w-xl space-y-4" @submit.prevent="onSubmit">
      <div>
        <label class="label">分类</label>
        <select v-model.number="form.categoryId" class="input" required>
          <option v-for="c in categoriesData?.items || []" :key="c.id" :value="c.id">
            {{ c.name }}
          </option>
        </select>
      </div>
      <div>
        <label class="label">正文</label>
        <textarea v-model="form.content" class="input min-h-[140px]" maxlength="5000" required />
      </div>
      <div>
        <label class="label">出处 / 作者</label>
        <input v-model="form.source" class="input" maxlength="200" />
      </div>
      <div>
        <label class="label">备注</label>
        <input v-model="form.note" class="input" maxlength="500" />
      </div>
      <div>
        <label class="label">语言</label>
        <select v-model="form.language" class="input">
          <option value="zh">中文</option>
          <option value="en">英文</option>
          <option value="other">其他</option>
        </select>
      </div>
      <label class="flex items-center gap-2 text-sm">
        <input v-model="form.isFavorite" type="checkbox" />
        收藏
      </label>
      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      <div class="flex gap-2">
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? '保存中…' : '保存' }}
        </button>
        <NuxtLink to="/app/quotes" class="btn-ghost">取消</NuxtLink>
      </div>
    </form>
  </div>
</template>
