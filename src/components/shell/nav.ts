export const apps = [
  { slug: "schedule", href: "/schedule", label: "Scheduler", blurb: "Book time across time zones, no double bookings." },
  { slug: "board", href: "/board", label: "Board", blurb: "Kanban with drag and drop, undo and sharing." },
  { slug: "expenses", href: "/expenses", label: "Expenses", blurb: "Track spending; scan receipts in your browser." },
] as const;

export type AppSlug = (typeof apps)[number]["slug"];
export const howItsBuiltHref = (slug: AppSlug) => `/how/${slug}`;
