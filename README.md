# 语录手帐（Nuxt + Pinia + Tailwind + MySQL）

个人语录 / 生活感悟 / 中英好句摘抄。API 使用 `mysql2` 手写 SQL，数据库复用本机 Docker 容器 `mysql8`。

## 启动

1. 确认容器在跑：`docker ps | grep mysql8`（端口 `3306`）
2. 复制环境变量并填写密码：

```bash
cp .env.example .env
# 编辑 NUXT_MYSQL_PASSWORD
```

3. 建库建表：

```bash
chmod +x scripts/db-init.sh
npm run db:init
```

4. 安装依赖并启动：

```bash
npm install
npm run dev
```

浏览器打开 http://localhost:3000

## 学习对照表

| API / 库 | 文件 | 说明 |
|---|---|---|
| `useCookie` | `composables/useTheme.ts` | 主题 `system/light/dark`（非 HttpOnly） |
| Pinia | `stores/auth.ts`、`stores/quoteFilter.ts` | 用户态、列表筛选 |
| `useState` | `layouts/app.vue`、`pages/app/quotes/index.vue` | 侧栏折叠、搜索草稿 |
| `useFetch` | `pages/app/quotes/index.vue`、`pages/app/categories/index.vue` | 列表响应式请求 |
| `useAsyncData` | `pages/app/index.vue`、`pages/app/quotes/[id]/index.vue` | 仪表盘 / 详情 |
| `$fetch` | 登录注册、增删改、收藏切换 | 事件触发的写操作 |
| `useHead` | 各页面；详情用语录摘要 | SEO title/description |
| HttpOnly Cookie | `server/utils/auth.ts` | `session_token` 会话（与主题 Cookie 分离） |

## 技术栈

- Nuxt 3 + TypeScript
- Pinia（`@pinia/nuxt`）
- Tailwind CSS（`@nuxtjs/tailwindcss`，`darkMode: 'class'`）
- MySQL 8（已有容器 `mysql8`）+ `mysql2`
- `bcryptjs` 密码哈希
