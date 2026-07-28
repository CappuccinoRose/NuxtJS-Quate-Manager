<template>
  <div class="min-h-screen">
    <header class="border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur">
      <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <NuxtLink to="/" class="font-serif text-lg tracking-wide text-accent">
          语录手帐
        </NuxtLink>
        <nav class="flex items-center gap-2 text-sm">
          <ThemeSwitch />
          <NuxtLink to="/login" class="btn-ghost">登录</NuxtLink>
          <NuxtLink to="/register" class="btn-primary">注册</NuxtLink>
        </nav>
      </div>
    </header>
    <main>
      <slot />
    </main>
  </div>
</template>
