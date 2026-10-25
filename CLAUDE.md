# Amjad's Corner v2

Portfolio of four AI-native apps. Full spec: `docs/spec.md` — read it before starting any feature.

## Conventions
- TypeScript strict; no `any`. Zod schemas are the single source of truth for shapes (forms, server actions, AI tools).
- Prefer Server Components and Server Actions; add route handlers only for streaming, webhooks, or external callers.
- DB access only through Drizzle in `src/db/`; schema in `src/db/schema/`, one file per app.
- Each app lives under `src/app/(apps)/<app>/` with its own `_components/`, `_actions/`, `_lib/`.
- Every AI call goes through `src/lib/ai/` (rate limit, usage logging, budget check). Never call a provider SDK directly from a feature.
- UI: shadcn/ui components in `src/components/ui/`; don't hand-roll primitives that shadcn provides.
- Guest users are real (anonymous) users — never branch on "logged in" for data ownership, only for upgrade prompts.

## Next.js 16 gotchas
- See `AGENTS.md`: this Next version differs from training data. Check `node_modules/next/dist/docs/` before using an unfamiliar API.
- `cacheComponents` is on. Anything reading `headers()`/`cookies()` (including `getSession()` in `src/lib/session.ts`) must render inside a `<Suspense>` boundary, and never be awaited at the top of a layout. Guide: `docs/01-app/02-guides/authentication-with-cache-components.md`.
- `npm run typecheck` runs `next typegen` first (for globals like `LayoutProps`).

## Auth & DB
- Better Auth (`src/lib/auth.ts`) with the anonymous plugin for guests. Its tables are hand-written in `src/db/schema/auth.ts` (the Better Auth CLI is stale); when adding an auth plugin, add its fields there and generate a migration.
- Schema change: edit `src/db/schema/*`, then `npm run db:generate && npm run db:migrate`. Commit the generated SQL in `drizzle/`.

## Commands
- `npm run db:up` — start local Postgres + pgvector (Docker)
- `npm run dev` / `npm run build`
- `npm run lint && npm run typecheck && npm test`

## Workflow
- Build in vertical slices; each slice ships with tests (Vitest for logic, Playwright for the happy path).
- Before finishing a task: `npm run lint && npm run typecheck && npm test`.
- Old v1 code is on `main` for reference only — don't port it.
