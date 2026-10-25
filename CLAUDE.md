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
- Reading the current time in a Server Component: `await connection()` first, then `new Date()` (lint rejects `Date.now()` in render).
- Never render browser-dependent values (time zone, `Intl.supportedValuesOf`, locale formatting) during SSR; use `useBrowserTimeZone()` (`null` on the server) to defer them, or hydration fails.
- React 19 resets uncontrolled form fields after a form action completes; use `defaultValue` from server data for edit forms.

## Auth & DB
- Better Auth (`src/lib/auth.ts`) with the anonymous plugin for guests. Its tables are hand-written in `src/db/schema/auth.ts` (the Better Auth CLI is stale); when adding an auth plugin, add its fields there and generate a migration.
- `getSession()` rebuilds the Cookie header from `cookies()` so a Server Action that just created a guest (`getOrCreateUser()`) sees the new session in its own re-render. Don't call `auth.api.getSession` directly.
- Constraints Drizzle can't express (e.g. the scheduler's exclusion constraint) go in a custom migration: `npx drizzle-kit generate --custom --name=<name>`.
- Schema change: edit `src/db/schema/*`, then `npm run db:generate && npm run db:migrate`. Commit the generated SQL in `drizzle/`.

## Commands
- `npm run db:up` — start local Postgres + pgvector (Docker)
- `npm run dev` / `npm run build`
- `npm run lint && npm run typecheck && npm test`
- `npm run build && npm run test:e2e` — Playwright against the production build (starts `next start` itself)

## App layout notes
- Scheduler: host UI under `/schedule`, public booking pages under `/meet/[handle]` (short links). Both use code from `src/app/(apps)/schedule/_lib`. Only `_actions/` files are `"use server"`; shared server logic (emails, cancellation) lives in `_lib/` so it isn't exposed as an endpoint.
- Emails go through `src/lib/email.ts`; without `RESEND_API_KEY` they're logged to the server console.

## Workflow
- Build in vertical slices; each slice ships with tests (Vitest for logic, Playwright for the happy path).
- Before finishing a task: `npm run lint && npm run typecheck && npm test`.
- Old v1 code is on `main` for reference only — don't port it.
