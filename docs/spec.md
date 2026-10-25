# Amjad's Corner v2 — Spec

A portfolio that proves capability by shipping real, product-quality apps on one modern stack. Every app must be usable by a visitor in under 30 seconds (guest mode), each one shows off a different skill, and **running the site must cost nothing beyond free tiers** — no paid AI APIs or other per-request charges.

## Apps

### 1. Portfolio — `/` (homepage)
An interactive portfolio rather than a static bio.
- Project showcase with live previews of the other apps and their "How it's built" write-ups.
- Content (bio, resume, projects) authored as MDX in `content/`.
- Three paths by visitor intent: "Hiring" (resume, skills, code samples), "Need something built" (book a call via the Scheduler), "Just exploring" (jump into the apps).
- Command palette (⌘K) for navigation.

### 2. Scheduler — `/schedule`
Calendly-style appointment booking.
- Hosts define event types (duration, buffer, location) and weekly availability with date overrides.
- Public booking page shows open slots in the visitor's time zone.
- Double-booking prevented at the database level (exclusion constraint on time ranges), not just in UI.
- Confirmation and cancellation/reschedule via emailed links (Resend free tier); `.ics` calendar attachments.
- Dogfooded: the homepage's "book a call with me" uses it.

### 3. Collab Board — `/board`
Multiplayer kanban.
- Boards → columns → cards; drag and drop with optimistic updates.
- Live cursors, presence avatars, realtime card sync (Liveblocks free tier).
- Guest boards auto-expire; signed-in users keep theirs.

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
| DB | Postgres — Docker locally, Neon (free tier) in production; Drizzle ORM |
| Auth | Better Auth — GitHub/Google OAuth + anonymous guest sessions |
| Realtime | Liveblocks (free tier) for presence/cursors; Postgres is source of truth for board data |
| OCR | Tesseract.js, client-side only |
| File storage | Vercel Blob (free tier) for receipt images |
| Email | Resend (free tier) |
| Validation | Zod, shared between forms and server actions |
| Testing | Vitest (unit), Playwright (e2e) |
| Hosting/CI | Vercel Hobby + GitHub Actions (lint, typecheck, test) |

## Local development
- `npm run db:up` runs Postgres (`pgvector/pgvector` image — fine as plain Postgres; pgvector is enabled but currently unused).
- External keys needed locally: Liveblocks (free). Blob and Resend can be stubbed in dev.
- Neon is only needed when we first deploy to Vercel.

## Audience
The site serves three goals at once, so each app is built to product quality, not demo quality:
- **Employers (full-stack)**: "How it's built" panels, clean code, tests, architecture notes.
- **Freelance clients**: polished, business-relevant demos and a clear "work with me" path (book a call through the Scheduler).
- **Founder track**: any app can grow into a product. Keep each app's boundaries clean (own schema, own routes) so it can later be spun out, and track basic usage to see which one gets traction.

## Cross-cutting requirements
- **Guest mode everywhere**: anonymous session on first visit, upgradeable to a real account without losing data.
- **Zero running cost**: stay inside free tiers; anything heavy (OCR) runs in the browser. Abuse limits on writes (Better Auth rate limiting for auth; per-user caps on boards/expenses/uploads).
- **Usage tracking**: lightweight first-party event table (app opened, item created) with a small admin page.
- **Accessibility & perf**: keyboard navigable, Lighthouse ≥ 90, dark/light theme.
- **Each app has a "How it's built" panel** linking to its code and explaining the architecture — this is the portfolio's real pitch.

## Build order
1. ✅ Scaffold: Next.js, Drizzle + local Postgres (Docker), Better Auth (guest + OAuth).
2. ✅ App shell: shadcn/ui, layout/nav, theme toggle, CI. (Vercel preview pending env vars.)
3. ✅ Scheduler. Remaining: reschedule in one step (today it's cancel + rebook), guest data cleanup, homepage book-a-call.
4. ✅ Expense Tracker. Remaining: currency other than USD, cleanup of orphaned receipt files when guests expire.
5. Collab Board (adds realtime).
6. Portfolio homepage, "How it's built" panels, cut over `main` and the domain.

## Decisions
- No paid AI APIs (cost). Client-side models are allowed where they add real value.
- Docs Q&A dropped; replaced by the Scheduler (chosen over a todo app as more distinctive and business-relevant).
- Realtime: Liveblocks (chosen over self-hosted Yjs/PartyKit for speed to ship).
