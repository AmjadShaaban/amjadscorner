import type { AppSlug } from "@/components/shell/nav";

// Showcase and "How it's built" content. Every claim here describes code in this repo;
// keep it in sync when the implementation changes.

export const repo = {
  url: "https://github.com/AmjadShaaban/amjadscorner",
  // Switch to "main" when v2 replaces v1.
  branch: "v2",
};

export const sourceUrl = (path: string) => `${repo.url}/tree/${repo.branch}/${path}`;

type Section = { title: string; body: string[]; source?: string };

export type AppContent = {
  slug: AppSlug;
  name: string;
  href: string;
  tagline: string;
  highlights: string[];
  stack: string[];
  how: { intro: string; sections: Section[]; tests: string[]; next: string[] };
};

export const appContent: AppContent[] = [
  {
    slug: "schedule",
    name: "Scheduler",
    href: "/schedule",
    tagline: "Share a link, let people book time with you. Calendly-style, built from scratch.",
    highlights: [
      "Double bookings are impossible: Postgres rejects overlapping bookings, even under concurrent requests",
      "Slots stay correct across time zones and daylight-saving changes",
      "Confirmation emails with calendar invites; private links to cancel",
    ],
    stack: ["Postgres exclusion constraint", "Temporal API", "Server Actions", "RFC 5545 .ics"],
    how: {
      intro:
        "Hosts set weekly hours and date overrides; invitees pick a slot in their own time zone. The interesting problems are correctness ones: never double-book, and never show a wrong time.",
      sections: [
        {
          title: "Double bookings are impossible, not just unlikely",
          body: [
            "Checking for a free slot and then inserting is a race: two requests can both see the slot as free. Instead, Postgres enforces it. An exclusion constraint (`EXCLUDE USING gist`, with `btree_gist`) rejects any confirmed booking whose time range, including the buffer after it, overlaps another for the same host.",
            "The server still re-computes the slot list before inserting, so nobody can book outside working hours, and it turns a constraint violation (`23P01`) into a friendly \"that time was just booked\" message. An end-to-end test races two browsers for the same slot and asserts exactly one wins.",
          ],
          source: "drizzle/0003_scheduler_no_overlap.sql",
        },
        {
          title: "Time zones and daylight saving",
          body: [
            "Availability is stored as wall-clock minutes in the host's time zone, and slots are generated with the Temporal API, so 9:00 stays 9:00 when the clocks change. The tests cover a DST week and a window that crosses the skipped hour.",
            "The visitor's time zone is only known in the browser, so the booking widget renders after hydration instead of guessing on the server, which would cause a hydration mismatch.",
          ],
          source: "src/app/(apps)/schedule/_lib",
        },
        {
          title: "Links that are secrets",
          body: [
            "Each booking gets a private manage link. The token is 32 random bytes; only its SHA-256 hash is stored, comparisons are constant-time, and the page sets `Referrer-Policy: no-referrer` so the token can't leak to other sites.",
            "Emails are sent with `after()`, once the response has gone out, so a slow email provider never delays a booking. Without an API key they're logged instead, which keeps local development free.",
          ],
          source: "src/app/(apps)/schedule/_lib/notify.ts",
        },
      ],
      tests: [
        "Unit: slot generation (weekends, notice, buffers, overrides, DST), .ics escaping and line folding",
        "E2E: a guest creates a booking page, an invitee in London books and cancels",
        "E2E: two invitees race for the same slot; exactly one gets it",
      ],
      next: ["One-step reschedule", "Two-way calendar sync"],
    },
  },
  {
    slug: "board",
    name: "Board",
    href: "/board",
    tagline: "Kanban with drag and drop that works with a mouse, touch or keyboard.",
    highlights: [
      "Moves feel instant and roll back if the server says no",
      "Fully keyboard accessible, with screen reader announcements",
      "Share with invite links; concurrent edits never silently overwrite each other",
    ],
    stack: ["dnd-kit", "Fractional indexing", "useOptimistic", "Advisory locks"],
    how: {
      intro:
        "A board looks simple until two people use it at once. Ordering, conflicting edits and accessibility drive the design.",
      sections: [
        {
          title: "Ordering with fractional indexes",
          body: [
            "Each card has a string key, and order is plain string order. Moving a card computes a key strictly between its new neighbours, so a move writes one row instead of renumbering the column. Keys are base-36, never end in zero (so there's always room), and appends step by one digit to keep keys short. A property test inserts 5,000 cards at random positions and checks the order stays strict.",
            "The server never trusts a key from the browser. It looks up the card's real neighbours under a per-board advisory lock and computes the key itself, so a stale view or two simultaneous moves still produce a valid, unique order. Keys are compared byte-wise (`COLLATE \"C\"`) to match JavaScript.",
          ],
          source: "src/app/(apps)/board/_lib/position.ts",
        },
        {
          title: "Instant, but honest",
          body: [
            "Moves, adds and deletes apply immediately with React's `useOptimistic` and roll back if the action fails. A \"Saving… / All changes saved\" status and a leave-page warning make sure a change isn't lost by closing the tab mid-save. ⌘Z undoes moves, and deletes are soft so the toast's Undo can restore them.",
            "Edits carry a version number. If someone else saved the card first, your save is rejected and you see their version instead of silently overwriting it.",
          ],
          source: "src/app/(apps)/board/_components/board-view.tsx",
        },
        {
          title: "Accessible drag and drop",
          body: [
            "Cards can be moved by mouse, touch (press and hold), or keyboard: Space to pick up, arrows to move, Space to drop. The library's default keyboard handling only moves within one list, so a custom coordinate getter jumps between columns. Every step is announced to screen readers using card and column names.",
          ],
        },
        {
          title: "Why no realtime (yet)",
          body: [
            "Live cursors need a long-lived WebSocket server, which Vercel doesn't host. Rather than make a third-party realtime service the centre of the demo, collaborators see each other's changes when they return to the tab. Live sync can be added later (for example on Cloudflare Durable Objects) without changing the data model.",
          ],
        },
      ],
      tests: [
        "Unit: fractional keys (property test), board state transitions used by drag, undo and optimistic updates",
        "E2E: mouse drag between columns, undo, persistence after reload",
        "E2E: keyboard-only move, checking the screen reader announcements",
        "E2E: owner and editor edit the same card; the second save sees the first",
        "E2E: viewers get no editing controls; strangers get a 404",
      ],
      next: ["Live sync on Durable Objects", "Drag to reorder columns", "Labels and due dates"],
    },
  },
  {
    slug: "expenses",
    name: "Expenses",
    href: "/expenses",
    tagline: "Track spending. Snap a receipt and it fills itself in, without sending it to an AI service.",
    highlights: [
      "Receipt text is read in your browser: free to run and private",
      "Receipts are stored privately and only ever served to their owner",
      "Accessible charts with tooltips, table views and a validated color palette",
    ],
    stack: ["Tesseract.js (WebAssembly)", "Vercel Blob (private)", "Hand-built charts", "CSV export"],
    how: {
      intro:
        "The goal was a genuinely useful receipt scanner that costs nothing to run, so the heavy lifting happens on the visitor's device.",
      sections: [
        {
          title: "OCR on the device",
          body: [
            "Tesseract.js runs in a Web Worker and is only downloaded when someone scans. Before reading, the photo is downscaled and re-encoded on a canvas, which keeps uploads under the 1 MB Server Action limit and strips EXIF data such as GPS location.",
            "A parser turns noisy OCR text into a merchant, total, date and category. It prefers \"grand total\" over \"total\", ignores subtotals, tax and cash tendered, and handles US and day-first dates. You always review the result before saving; \"What was read\" shows the raw text.",
          ],
          source: "src/app/(apps)/expenses/_lib/receipt-parser.ts",
        },
        {
          title: "Private by default",
          body: [
            "Receipts are stored with private access and never linked directly. A route streams each image only after checking that the signed-in user owns the expense. Uploads are identified by their magic bytes rather than the type the browser claims.",
            "Money is stored as integer cents. The CSV export prefixes values that start with `=`, `+`, `-` or `@` so a malicious merchant name can't run as a spreadsheet formula.",
          ],
          source: "src/lib/storage.ts",
        },
        {
          title: "Charts that everyone can read",
          body: [
            "The charts are plain HTML and CSS, built to a written data-viz spec. Colors were checked with a contrast and color-blindness validator against the actual card backgrounds in both themes, and every chart has hover and keyboard tooltips plus a data table view.",
          ],
          source: "src/app/(apps)/expenses/_components/charts.tsx",
        },
      ],
      tests: [
        "Unit: receipt parsing (totals, dates, merchants, categories), money parsing, CSV escaping",
        "E2E: a generated receipt photo is read in the browser and fills in all four fields",
        "E2E: the owner can load their receipt; another visitor gets a 404",
        "E2E: add, edit and delete; sample data, month navigation and CSV export",
      ],
      next: ["Multiple currencies", "Recurring expenses", "Budgets per category"],
    },
  },
];

export const platformFacts = [
  { title: "Tested", body: "Unit tests for the tricky logic and browser tests for every app, run in CI on each push." },
  { title: "Accessible", body: "Keyboard-only flows, screen reader announcements, visible focus and checked contrast." },
  { title: "Zero running cost", body: "Free tiers only. Heavy work, like OCR, runs in the browser." },
  { title: "Try without signing up", body: "Every app works as a guest; sign in later to keep your data." },
];
