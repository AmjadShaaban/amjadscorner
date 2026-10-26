# Amjad's Corner v2

Portfolio of four product-quality apps that must run at zero cost (free tiers only, no paid AI APIs). Full spec: `docs/spec.md` — read it before starting any feature.

## Conventions
- TypeScript strict; no `any`. Zod schemas are the single source of truth for shapes (forms, server actions, AI tools).
- Prefer Server Components and Server Actions; add route handlers only for streaming, webhooks, or external callers.
- DB access only through Drizzle in `src/db/`; schema in `src/db/schema/`, one file per app.
- Each app lives under `src/app/(apps)/<app>/` with its own `_components/`, `_actions/`, `_lib/`.
- Never add a dependency or service that charges per request. Heavy work (e.g. OCR) runs client-side.
- UI: shadcn/ui components in `src/components/ui/` (add with `npx shadcn@latest add <name>`); don't hand-roll primitives that shadcn provides. The preset is `base-nova`, built on **Base UI, not Radix**: compose with the `render` prop (`<DropdownMenuTrigger render={<Button />}>`), not `asChild`. Read the generated component before using it.
- Site chrome lives in `src/components/shell/`; the app list for nav and the homepage is `src/components/shell/nav.ts`.
- Guest users are real (anonymous) users — never branch on "logged in" for data ownership, only for upgrade prompts.

## Next.js 16 gotchas
- See `AGENTS.md`: this Next version differs from training data. Check `node_modules/next/dist/docs/` before using an unfamiliar API.
- `cacheComponents` is on. Anything reading `headers()`/`cookies()` (including `getSession()` in `src/lib/session.ts`) must render inside a `<Suspense>` boundary, and never be awaited at the top of a layout. Guide: `docs/01-app/02-guides/authentication-with-cache-components.md`.
- `npm run typecheck` runs `next typegen` first (for globals like `LayoutProps`).
- Client hooks that read the URL (`usePathname`, `useSearchParams`) are dynamic on param routes and also need `<Suspense>` (see `NavLinks` and its static fallback).
- `notFound()` after streaming starts can't change the status (stays 200, Next adds `noindex`). The root layout streams, so pages effectively always do this; that's accepted. Use a Proxy only if a real 404 status is ever required.
- Reading the current time in a Server Component: `await connection()` first, then `new Date()` (lint rejects `Date.now()` in render).
- `partialPrefetching` is on: the prefetched App Shell may read cookies/headers but not the clock, so code that checks time after reading them (Better Auth session expiry) needs `await connection()` first. `getSession()` does this.
- The App Shell is shared by every link to a route, so `params`/`searchParams` must be read inside `<Suspense>` (page renders `<main>` + fallback, a child awaits params; see `how/[slug]`). Links whose content is prerendered or cached can use `prefetch` to fetch it before the click.
- Never render browser-dependent values (time zone, `Intl.supportedValuesOf`, locale formatting) during SSR; use `useBrowserTimeZone()` (`null` on the server) to defer them, or hydration fails.
- React 19 resets uncontrolled form fields after a form action completes; use `defaultValue` from server data for edit forms.
- **Visited pages stay mounted but hidden** (React `<Activity>`, see `docs/01-app/02-guides/preserving-ui-state.md`). Consequences:
  - Never use static DOM `id`s (useId isn't safe either): label controls with `FormField` (`src/components/form-field.tsx`), which nests the control inside its `<label>`.
  - "Create" forms must reset when hidden (see `ExpenseForm`'s `useLayoutEffect` cleanup); key edit forms by `updatedAt` so they remount with fresh data.
  - In Playwright, query with `getByRole` (visible only); `getByLabel`/`locator` can hit a hidden page's element.

## Auth & DB
- Better Auth (`src/lib/auth.ts`) with the anonymous plugin for guests. Its tables are hand-written in `src/db/schema/auth.ts` (the Better Auth CLI is stale); when adding an auth plugin, add its fields there and generate a migration.
- `getSession()` rebuilds the Cookie header from `cookies()` so a Server Action that just created a guest (`getOrCreateUser()`) sees the new session in its own re-render. Don't call `auth.api.getSession` directly.
- Constraints Drizzle can't express (e.g. the scheduler's exclusion constraint) go in a custom migration: `npx drizzle-kit generate --custom --name=<name>`.
- Schema change: edit `src/db/schema/*`, then `npm run db:generate && npm run db:migrate`. Commit the generated SQL in `drizzle/`.

## Cleanup
- `src/lib/cleanup.ts` runs daily via Vercel Cron (`vercel.json` → `/api/cron/cleanup`, Bearer `CRON_SECRET`). It deletes guests with no live session (+1 day grace); cascades remove their rows. Apps add hooks for what cascades can't do (`expenses/_lib/cleanup.ts` deletes receipt files by recorded path, never by prefix; `board/_lib/cleanup.ts` hands shared boards to a real member). New apps that store files or shared data must add a hook here.
- Run locally: `curl -H "Authorization: Bearer $CRON_SECRET" localhost:3000/api/cron/cleanup`.
- Tests named `*.integration.test.ts` use the real local Postgres; vitest stubs `server-only` and loads `.env.local`.

## Commands
- `npm run db:up` — start local Postgres + pgvector (Docker)
- `npm run dev` / `npm run build`
- `npm run lint && npm run typecheck && npm test`
- `npm run build && npm run test:e2e` — Playwright against the production build on port 3100 (starts `next start` itself, so a dev server on :3000 is unaffected)

## App layout notes
- Scheduler: host UI under `/schedule`, public booking pages under `/meet/[handle]` (short links). Both use code from `src/app/(apps)/schedule/_lib`. Only `_actions/` files are `"use server"`; shared server logic (emails, cancellation) lives in `_lib/` so it isn't exposed as an endpoint.
- Emails go through `src/lib/email.ts`; without `RESEND_API_KEY` they're logged to the server console.
- Files go through `src/lib/storage.ts` (private Vercel Blob, or `.data/uploads` locally). Never serve storage URLs directly; stream through a route that checks ownership (see `expenses/receipts/[id]`). Identify uploads with `sniffImage`, not the client's MIME type.
- Board: order with `byPosition()` (COLLATE "C") and compute keys with `positionBetween()` server-side inside `lockBoard()`; never trust a client-sent key. Access is checked by `requireAccess(boardId, minRole)` in every action. Pure client state helpers live in `_lib/board-state.ts` (tested).
- Homepage and "How it's built" content: `src/content/profile.ts` (personal details, has TODOs for the owner) and `src/content/apps.ts` (every claim must match the code). Showcase images come from `npm run screenshots` (after `npm run build`) into `src/content/screens/` and are imported statically for hashed URLs.
- Expenses: OCR is Tesseract.js in the browser (`receipt-image.ts`, model loaded from the jsDelivr CDN on first scan); `receipt-parser.ts` turns its text into fields and is unit-tested. Charts are hand-built HTML/CSS following the dataviz skill; colors are the `--viz-*` tokens in `globals.css`.

## Workflow
- Build in vertical slices; each slice ships with tests (Vitest for logic, Playwright for the happy path).
- Before finishing a task: `npm run lint && npm run typecheck && npm test`.
- Old v1 code is on `main` for reference only — don't port it.
