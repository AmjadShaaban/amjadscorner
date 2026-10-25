# Amjad's Corner v2 — Spec

A portfolio that proves capability by shipping four real, AI-native apps on one modern stack. Every app must be usable by a visitor in under 30 seconds (guest/demo mode), and each one shows off a different skill.

## Apps

### 1. Portfolio Agent — `/` (homepage)
Visitors chat with an agent that knows Amjad's work, rather than reading a static bio.
- RAG over curated content (resume, project write-ups, the other three apps' READMEs) in `content/`.
- Tool calls render rich UI inline: `showProject`, `showResume`, `listSkills`, `contactAmjad` (stores lead + sends email).
- Streaming responses, suggested prompts, graceful fallback to a static portfolio if AI is unavailable.
- Eval suite: a fixed set of questions with expected facts, run in CI.

### 2. Collab Board — `/board`
Multiplayer kanban.
- Boards → columns → cards; drag and drop with optimistic updates.
- Live cursors, presence avatars, realtime card sync.
- AI: "break this card into subtasks", "turn these notes into cards", board summary.
- Guest boards auto-expire; signed-in users keep theirs.

### 3. Docs Q&A — `/docs-qa`
Upload documents, ask questions, get cited answers.
- PDF/MD/TXT upload → background ingestion (parse → chunk → embed → pgvector).
- Ingestion progress shown live.
- Answers stream with inline citations that jump to the source chunk.
- Hybrid search (vector + Postgres full-text), per-user document isolation.

### 4. Receipt Tracker — `/expenses`
Snap a receipt, get structured data.
- Image upload/camera → vision model extracts merchant, date, line items, tax, total as typed structured output.
- User reviews/edits extraction before saving (human-in-the-loop).
- Dashboard: spend by category/month, trends, top merchants.
- Natural-language queries ("how much on food in September?") via tool calls over SQL.

## Stack

| Concern | Choice |
|---|---|
| Framework | Next.js (latest, App Router), React, TypeScript strict |
| UI | Tailwind CSS + shadcn/ui, Motion for animation |
| DB | Postgres + pgvector — Docker locally, Neon in production; Drizzle ORM |
| Auth | Better Auth — GitHub/Google OAuth + anonymous guest sessions |
| AI | Claude via Vercel AI SDK (Anthropic provider); embeddings via Voyage AI |
| Realtime | Liveblocks for presence/cursors; Postgres is source of truth for board data |
| Background jobs | Inngest (doc ingestion, guest cleanup) |
| File storage | Vercel Blob |
| Rate limiting | Upstash Ratelimit on every AI endpoint (cost protection) |
| Email | Resend |
| Validation | Zod, shared between forms, server actions and AI tool schemas |
| Testing | Vitest (unit), Playwright (e2e), AI evals in CI |
| Hosting/CI | Vercel + GitHub Actions (lint, typecheck, test, evals) |

## Local development
- `docker compose up -d` runs Postgres with pgvector (`pgvector/pgvector` image); `DATABASE_URL` points at it.
- Inngest dev server via `npx inngest-cli dev` (no Docker needed).
- External keys needed locally: Anthropic, Voyage, Liveblocks (all have free tiers). Blob/Resend/Upstash can be stubbed in dev.
- Neon is only needed when we first deploy to Vercel.

## Audience
The site serves three goals at once, so each app is built to product quality, not demo quality:
- **Employers (full-stack & AI engineering)**: "How it's built" panels, clean code, tests, evals, architecture notes.
- **Freelance clients**: polished, business-relevant demos and a clear "work with me" contact path (the agent's `contactAmjad` tool).
- **Founder track**: any app can grow into a product. Keep each app's boundaries clean (own schema, own routes) so it can later be spun out into its own repo, and track usage so we can see which one gets traction.

The homepage agent routes visitors by intent: "hiring", "need a project built", or "just exploring".

## Cross-cutting requirements
- **Guest mode everywhere**: anonymous session on first visit, upgradeable to a real account without losing data.
- **Cost safety**: per-IP and per-user rate limits, max tokens/file sizes, a global daily AI budget kill-switch.
- **Observability**: log AI calls (model, tokens, latency) to a table; simple admin page to view usage.
- **Accessibility & perf**: keyboard navigable, Lighthouse ≥ 90, dark/light theme.
- **Each app has a "How it's built" panel** linking to its code and explaining the architecture — this is the portfolio's real pitch.

## Build order
1. Scaffold: Next.js, Tailwind/shadcn, Drizzle + local Postgres (Docker), Better Auth (guest + OAuth), CI, Vercel preview.
2. Shared AI layer: client, rate limiting, usage logging, budget kill-switch.
3. Portfolio Agent (homepage).
4. Receipt Tracker (smallest AI-native slice beyond chat).
5. Docs Q&A (adds jobs, blob storage, pgvector).
6. Collab Board (adds realtime).
7. Polish, "How it's built" panels, cut over `main` and the domain.

## Decisions
- Realtime: Liveblocks (chosen over self-hosted Yjs/PartyKit for speed to ship).
