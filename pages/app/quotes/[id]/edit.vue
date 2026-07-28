<script setup lang="ts">
import type { Category, Quote, QuoteLanguage } from '~/types/models'

definePageMeta({ layout: 'app', middleware: ['auth'] })
useHead({ title: '编辑语录 · 语录手帐' })

const route = useRoute()
const id = String(route.params.id)

const { data: quoteData } = await useAsyncData(`quote-edit-${id}`, () =>
  $fetch<{ item: Quote }>(`/api/quotes/${id}`),
)
const { data: categoriesData } = await useFetch<{ items: Category[] }>('/api/categories')

const form = reactive({
  categoryId: quoteData.value?.item.categoryId ?? 0,
  content: quoteData.value?.item.content ?? '',
  source: quoteData.value?.item.source ?? '',
  note: quoteData.value?.item.note ?? '',
  language: (quoteData.value?.item.language ?? 'zh') as QuoteLanguage,
  isFavorite: quoteData.value?.item.isFavorite ?? false,
})

const error = ref('')
const loading = ref(false)

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    await $fetch(`/api/quotes/${id}`, {
      method: 'PUT',
      body: { ...form },
    })
    await navigateTo(`/app/quotes/${id}`)
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
    <h1 class="font-serif text-2xl">编辑语录</h1>
    <p v-if="!quoteData?.item" class="mt-4 text-red-600">语录不存在</p>
    <form v-else class="mt-6 max-w-xl space-y-4" @submit.prevent="onSubmit">
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
        <NuxtLink :to="`/app/quotes/${id}`" class="btn-ghost">取消</NuxtLink>
      </div>
    </form>
  </div>
</template>
