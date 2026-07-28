<script setup lang="ts">
// 演示 useHead：落地页标题
useHead({
  title: '语录手帐',
  meta: [{ name: 'description', content: '记录生活感悟与中英文好句' }],
})
</script>

<template>
  <section
    class="relative mx-auto flex min-h-[calc(100vh-57px)] max-w-5xl flex-col justify-center px-4 py-16"
  >
    <div
      class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_#d8ebe4_0%,_transparent_55%)] dark:bg-[radial-gradient(ellipse_at_top,_#1a332c_0%,_transparent_55%)]"
    />
    <p class="font-serif text-5xl tracking-wide text-accent md:text-6xl">语录手帐</p>
    <p class="mt-4 max-w-md text-[var(--muted)]">
      收集生活感悟、中文好句与英文摘抄。本地 MySQL + Nuxt 服务端 API，适合学习 Pinia 与组合式函数。
    </p>
    <div class="mt-8 flex flex-wrap gap-3">
      <NuxtLink to="/register" class="btn-primary">开始记录</NuxtLink>
      <NuxtLink to="/login" class="btn-ghost">已有账号</NuxtLink>
    </div>
  </section>
</template>
