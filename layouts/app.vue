<script setup lang="ts">
const auth = useAuthStore()
const route = useRoute()

// 演示 useState：布局内临时 UI 状态（侧栏折叠），不放进 Pinia
const sidebarCollapsed = useState('app-sidebar-collapsed', () => false)

const links = [
  { to: '/app', label: '仪表盘', exact: true },
  { to: '/app/quotes', label: '语录' },
  { to: '/app/categories', label: '分类' },
]

function isActive(to: string, exact?: boolean) {
  if (exact) return route.path === to
  return route.path === to || route.path.startsWith(`${to}/`)
}

async function onLogout() {
  await auth.logout()
  await navigateTo('/login')
}
</script>

<template>
  <div class="min-h-screen lg:flex">
    <aside
      class="border-b border-[var(--border)] bg-[var(--surface)] lg:min-h-screen lg:border-b-0 lg:border-r"
      :class="sidebarCollapsed ? 'lg:w-16' : 'lg:w-52'"
    >
      <div class="flex items-center justify-between gap-2 px-3 py-4">
        <NuxtLink
          v-show="!sidebarCollapsed"
          to="/app"
          class="font-serif text-lg text-accent"
        >
          语录手帐
        </NuxtLink>
        <button
          type="button"
          class="btn-ghost px-2"
          :title="sidebarCollapsed ? '展开' : '折叠'"
          @click="sidebarCollapsed = !sidebarCollapsed"
        >
          {{ sidebarCollapsed ? '»' : '«' }}
        </button>
      </div>
      <nav class="flex gap-1 px-2 pb-3 lg:flex-col">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="rounded-md px-3 py-2 text-sm transition"
          :class="
            isActive(link.to, link.exact)
              ? 'bg-accent/10 text-accent'
              : 'text-[var(--muted)] hover:bg-black/5 dark:hover:bg-white/5'
          "
        >
          <span v-if="!sidebarCollapsed">{{ link.label }}</span>
          <span v-else>{{ link.label.slice(0, 1) }}</span>
        </NuxtLink>
      </nav>
    </aside>

    <div class="flex min-w-0 flex-1 flex-col">
      <header
        class="flex items-center justify-end gap-3 border-b border-[var(--border)] bg-[var(--surface)]/80 px-4 py-3 backdrop-blur"
      >
        <span class="text-sm text-[var(--muted)]">
          {{ auth.user?.displayName || auth.user?.username }}
        </span>
        <ThemeSwitch />
        <button type="button" class="btn-ghost" @click="onLogout">退出</button>
      </header>
      <main class="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
        <slot />
      </main>
    </div>
  </div>
</template>
