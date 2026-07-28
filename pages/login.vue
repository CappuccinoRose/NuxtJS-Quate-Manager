<script setup lang="ts">
definePageMeta({ middleware: ['guest'] })

useHead({ title: '登录 · 语录手帐' })

const auth = useAuthStore()
const route = useRoute()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    // 演示 $fetch：登录写操作
    const data = await $fetch<{ user: { id: number; username: string; displayName: string | null } }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: { username: username.value, password: password.value },
      },
    )
    auth.setUser(data.user)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/app'
    await navigateTo(redirect)
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string }
    error.value = err?.data?.statusMessage || err?.statusMessage || '登录失败'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-sm px-4 py-16">
    <h1 class="font-serif text-2xl text-accent">登录</h1>
    <form class="mt-8 space-y-4" @submit.prevent="onSubmit">
      <div>
        <label class="label" for="username">用户名</label>
        <input id="username" v-model="username" class="input" autocomplete="username" required />
      </div>
      <div>
        <label class="label" for="password">密码</label>
        <input
          id="password"
          v-model="password"
          type="password"
          class="input"
          autocomplete="current-password"
          required
        />
      </div>
      <p v-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
      <button type="submit" class="btn-primary w-full" :disabled="loading">
        {{ loading ? '登录中…' : '登录' }}
      </button>
    </form>
    <p class="mt-4 text-sm text-[var(--muted)]">
      没有账号？
      <NuxtLink to="/register" class="text-accent underline">注册</NuxtLink>
    </p>
  </div>
</template>
