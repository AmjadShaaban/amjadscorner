# Amjad's Corner v2 — Spec

A portfolio that proves capability by shipping real, product-quality apps on one modern stack. Every app must be usable by a visitor in under 30 seconds (guest mode), each one shows off a different skill, and **running the site must cost nothing beyond free tiers** — no paid AI APIs or other per-request charges.

## Apps

### 1. Portfolio — `/` (homepage)
An interactive portfolio rather than a static bio.
- Project showcase with live previews of the other apps and their "How it's built" write-ups.
- Content as typed TS modules in `src/content/` (simpler than MDX; write-ups are structured sections).
- Three paths by visitor intent: "Curious how I work?" (the apps, write-ups and tests), "Need something built?" (Valiance Development LLC at valiancedev.com; falls back to booking a call via the Scheduler), "Just exploring?" (jump into the apps). No "hiring" framing: the portfolio shows the person, and client work goes through the LLC.
- Command palette (⌘K) for navigation.

### 2. Scheduler — `/schedule`
Calendly-style appointment booking.
- Hosts define event types (duration, buffer, location) and weekly availability with date overrides.
- Public booking page shows open slots in the visitor's time zone.
- Double-booking prevented at the database level (exclusion constraint on time ranges), not just in UI.
- Confirmation and cancellation/reschedule via emailed links (Resend free tier); `.ics` calendar attachments.
- Dogfooded: the homepage's "book a call with me" uses it.

### 3. Board — `/board`
Kanban for individuals and small teams (no realtime in v2; see Decisions).
- Boards → columns → cards. Cards ordered by fractional-index keys, so a move writes one row; the server computes keys under a per-board advisory lock.
- Drag and drop with mouse, touch and keyboard (Space/arrows), with screen-reader announcements.
- Optimistic UI with rollback, "Saving… / All changes saved" status, ⌘Z to undo moves, Undo toast for deletes (soft delete).
- Sharing via invite links (editor/viewer), members and link management for the owner; collaborators' changes appear on tab focus.
- Card edits use optimistic concurrency (version number): a stale save is rejected and shows the other person's version.

### 4. Expense Tracker — `/expenses`
Track spending, optionally from a receipt photo.
- Receipt photo → **in-browser** OCR (Tesseract.js, runs on the visitor's device, no server cost) pre-fills merchant, date and total; user reviews/edits before saving.
- Manual entry always available.
- Dashboard: spend by category/month, trends, top merchants; CSV export.

## Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Cache Components), React 19, TypeScript strict |
| UI | Tailwind CSS + shadcn/ui, Motion for animation |
| DB | Postgres — Docker locally, Neon (free tier, us-east-2) in production; Drizzle ORM on node-postgres (`pg`) with `attachDatabasePool` for Vercel Fluid compute |
| Auth | Better Auth — GitHub/Google OAuth + anonymous guest sessions |
| Drag and drop | dnd-kit (core + sortable) |
| OCR | Tesseract.js, client-side only |
| File storage | Vercel Blob (free tier) for receipt images |
| Email | Resend (free tier) |
| Validation | Zod, shared between forms and server actions |
| Testing | Vitest (unit), Playwright (e2e) |
| Hosting/CI | Vercel Hobby + GitHub Actions (lint, typecheck, test) |

## Local development
- `npm run db:up` runs Postgres (`pgvector/pgvector` image — fine as plain Postgres; pgvector is enabled but currently unused).
- No external keys are needed locally. Blob, Resend and OAuth are optional and stubbed when unset.
- Neon project `little-salad-23052577`, branch `production`, linked via `neon.ts` + `.neon` (gitignored). Vercel functions run in `cle1` (Cleveland) to sit next to the database (us-east-2).

## Audience
The site serves three goals at once, so each app is built to product quality, not demo quality:
- **Employers (full-stack)**: "How it's built" panels, clean code, tests, architecture notes.
- **Freelance clients**: polished, business-relevant demos and a clear "work with me" path (book a call through the Scheduler).
- **Founder track**: any app can grow into a product. Keep each app's boundaries clean (own schema, own routes) so it can later be spun out, and track basic usage to see which one gets traction.

## Cross-cutting requirements
- **Guest mode everywhere**: anonymous session on first visit, upgradeable to a real account without losing data. Guests whose sessions have expired are deleted daily with their data and files; boards shared with real users pass to one of them.
- **Zero running cost**: stay inside free tiers; anything heavy (OCR) runs in the browser. Abuse limits on writes (Better Auth rate limiting for auth; per-user caps on boards/expenses/uploads).
- **Usage tracking**: lightweight first-party event table (app opened, item created) with a small admin page.
- **Accessibility & perf**: keyboard navigable, Lighthouse ≥ 90, dark/light theme.
- **Each app has a "How it's built" panel** linking to its code and explaining the architecture — this is the portfolio's real pitch.

## Build order
1. ✅ Scaffold: Next.js, Drizzle + local Postgres (Docker), Better Auth (guest + OAuth).
2. ✅ App shell: shadcn/ui, layout/nav, theme toggle, CI. (Vercel preview pending env vars.)
3. ✅ Scheduler. Remaining: reschedule in one step (today it's cancel + rebook), guest data cleanup, homepage book-a-call.
4. ✅ Expense Tracker. Remaining: currency other than USD, cleanup of orphaned receipt files when guests expire.
5. ✅ Board. Remaining: drag to reorder columns (menu-based today), card due dates/labels.
6. Portfolio homepage ✅, "How it's built" pages ✅, ⌘K palette ✅, mobile nav ✅. Guest cleanup ✅ (daily cron). Remaining: owner's bio/links (TODOs in `src/content/profile.ts`), deploy and cut over `main` and the domain.

## Decisions
- No paid AI APIs (cost). Client-side models are allowed where they add real value.
- Docs Q&A dropped; replaced by the Scheduler (chosen over a todo app as more distinctive and business-relevant).
- Board ships without realtime in v2: Vercel can't hold WebSockets, and a SaaS (Liveblocks) would be the weak point of the demo. A later version can add live sync on Cloudflare Durable Objects without changing the data model.
