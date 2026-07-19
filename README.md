# 交换人生 Exchange Life

这是“交换人生”比赛项目的工程仓库。当前目标是桌面优先 Web 产品，技术骨架已经切到 **Next.js App Router + Supabase + Server-side AI**。

## 本地开发

```bash
npm install
npm run dev
```

访问 `http://localhost:3000`。当前已有的产品 Demo 页面通过 Next 客户端入口承载，后续页面可以逐步迁移成原生 App Router 页面。

## 环境变量

复制 `.env.example` 为 `.env.local`，在项目根目录填写：

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
AI_PROVIDER=mock
OPENAI_API_KEY=
AI_TEXT_MODEL=gpt-4.1-mini
AI_IMAGE_MODEL=gpt-image-1
SIGNED_URL_TTL_SECONDS=3600
DATABASE_URL=
```

`NEXT_PUBLIC_*` 可以进入浏览器。`SUPABASE_SERVICE_ROLE_KEY` 和 `OPENAI_API_KEY` 只能在服务端使用，不能写进前端组件、Vite 变量或客户端 store。

## 关键目录

- `src/app/`：Next App Router 页面和 API Route Handlers。
- `src/app/client-app.tsx`：临时承载现有 React Router Demo 的客户端桥接层。
- `src/legacy-pages/`：从 Vite demo 迁入的页面组件，后续可逐步迁为原生 Next 页面。
- `src/lib/config/public-env.ts`：浏览器可读取的公开环境变量。
- `src/lib/supabase/`：Supabase 浏览器客户端与服务端会话客户端。
- `src/server/config/env.ts`：服务端环境变量校验。
- `src/server/supabase/admin.ts`：仅服务端后台任务使用的 Supabase service-role client。
- `src/server/ai/`：AI provider 接口、mock provider、OpenAI provider。
- `supabase/migrations/`：数据库 schema 与 RLS migration。
- `docs/`：PRD、功能需求、交互、架构、权限与验收文档。

## 服务端 API 骨架

- `GET /api/health`：检查 Next 服务端、Supabase 配置状态和 AI provider。
- `POST /api/ai/writing-guide`：写作引导。
- `POST /api/ai/organize-narrative`：草稿整理。
- `POST /api/ai/generate-storybook`：单方或双方共同绘本生成。

默认 `AI_PROVIDER=mock`，不需要真实 OpenAI key。切到真实 AI 时设置：

```bash
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
```

## 数据库

初始 schema 在 `supabase/migrations/0001_initial_schema.sql`。它覆盖双人空间、交换、邀请、私有草稿、素材、AI 任务、故事源、绘本、信件、回执、反应、交汇和记忆碎片等核心表，并启用 RLS。

当前仓库不会自动连接或修改真实 Supabase 项目。接入时用 Supabase CLI 或平台 SQL editor 执行 migration，再把项目 URL、anon key、service role key 填入 `.env.local`。

## 验证

```bash
npm run typecheck
npm run build
npm test
```

`npm test` 目前是轻量 smoke test，用于确保 Demo 路由、双用户本地状态和关键文案仍存在。
