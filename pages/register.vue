<script setup lang="ts">
definePageMeta({ middleware: ['guest'] })

useHead({ title: '注册 · 语录手帐' })

const auth = useAuthStore()

const username = ref('')
const password = ref('')
const displayName = ref('')
const error = ref('')
const loading = ref(false)

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    const data = await $fetch<{ user: { id: number; username: string; displayName: string | null } }>(
      '/api/auth/register',
      {
        method: 'POST',
        body: {
          username: username.value,
          password: password.value,
          displayName: displayName.value || undefined,
        },
      },
    )
    auth.setUser(data.user)
    await navigateTo('/app')
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string }
    error.value = err?.data?.statusMessage || err?.statusMessage || '注册失败'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-sm px-4 py-16">
    <h1 class="font-serif text-2xl text-accent">注册</h1>
    <p class="mt-2 text-sm text-[var(--muted)]">注册后自动创建默认分类（生活感悟 / 中英好句等）</p>
    <form class="mt-8 space-y-4" @submit.prevent="onSubmit">
      <div>
        <label class="label" for="username">用户名</label>
        <input
          id="username"
          v-model="username"
          class="input"
          pattern="[A-Za-z0-9_]{3,50}"
          title="3–50 位字母、数字或下划线"
          autocomplete="username"
          required
        />
      </div>
      <div>
        <label class="label" for="displayName">展示名（可选）</label>
        <input id="displayName" v-model="displayName" class="input" maxlength="50" />
      </div>
      <div>
        <label class="label" for="password">密码</label>
        <input
          id="password"
          v-model="password"
          type="password"
          class="input"
          minlength="6"
          autocomplete="new-password"
          required
        />
      </div>
      <p v-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
      <button type="submit" class="btn-primary w-full" :disabled="loading">
        {{ loading ? '提交中…' : '注册' }}
      </button>
    </form>
    <p class="mt-4 text-sm text-[var(--muted)]">
      已有账号？
      <NuxtLink to="/login" class="text-accent underline">登录</NuxtLink>
    </p>
  </div>
</template>
