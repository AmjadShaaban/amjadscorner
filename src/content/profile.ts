// Everything personal on the homepage comes from here. Fields marked TODO are
// placeholders: replace them with real details (nothing here is made up about you).

export const profile = {
  name: "Amjad Shaaban",
  // TODO: your role, e.g. "Full-stack engineer"
  role: "Full-stack engineer",
  // TODO: one or two sentences in your own voice.
  pitch: "I build product-quality web apps end to end, from database constraints to accessible, tested UI.",
  // TODO: city/region and whether you're open to remote work.
  location: "",
  // Handle of your Scheduler profile; "Book a call" links to /meet/<handle>.
  // TODO: create this profile at /schedule (signed in), then keep the handle in sync here.
  bookingHandle: "amjad",
  links: {
    github: "https://github.com/AmjadShaaban",
    // TODO: add or remove.
    linkedin: "",
    email: "",
  },
  // TODO: a short paragraph or two about you.
  about: [] as string[],
  // TODO: adjust to what you actually want to be hired for.
  skills: [
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "PostgreSQL",
    "Drizzle ORM",
    "Tailwind CSS",
    "Playwright",
    "Vitest",
    "Accessibility",
  ],
};
