// Captures the homepage showcase images from a running production build.
// Usage: npm run build && npm run screenshots   (starts its own server on :3200)
import { spawn } from "node:child_process";
import { chromium } from "@playwright/test";

const PORT = 3200;
const base = `http://localhost:${PORT}`;
const out = (name) => `src/content/screens/${name}.png`;

const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
  env: { ...process.env, BETTER_AUTH_URL: base },
  stdio: "ignore",
});
for (let i = 0; i < 60; i++) {
  try {
    await fetch(base);
    break;
  } catch {
    await new Promise((r) => setTimeout(r, 500));
  }
}

const browser = await chromium.launch();
// Every capture is 16:9 so the showcase lines up; the width is chosen per app so its
// content fills the frame. 2x pixel density keeps text sharp on high-DPI screens.
const frame = (width) => ({ viewport: { width, height: Math.round((width * 9) / 16) }, deviceScaleFactor: 2 });

async function shoot(page, name) {
  // Hide the site header and any toasts: the showcase frames the app itself.
  await page.addStyleTag({ content: "header, [data-sonner-toaster] { display: none !important; }" });
  await page.evaluate(() => window.scrollTo(0, 0));
  for (const scheme of ["light", "dark"]) {
    await page.emulateMedia({ colorScheme: scheme });
    await page.waitForTimeout(250);
    await page.screenshot({ path: out(`${name}-${scheme}`), animations: "disabled" });
  }
}

try {
  // Scheduler: a public booking page.
  {
    const page = await (await browser.newContext({ baseURL: base, ...frame(960), timezoneId: "America/New_York" })).newPage();
    const handle = `demo-${Date.now().toString(36)}`;
    await page.goto("/schedule");
    await page.getByRole("textbox", { name: "Your name" }).fill("Demo Host");
    await page.getByRole("textbox", { name: "Booking link" }).fill(handle);
    await page.getByRole("combobox", { name: "Time zone" }).selectOption("America/New_York");
    await page.getByRole("button", { name: "Create my booking page" }).click();
    await page.getByRole("textbox", { name: "Title" }).fill("Intro call");
    await page.getByRole("textbox", { name: "URL" }).fill("intro");
    await page.getByRole("combobox", { name: "Location" }).or(page.getByRole("textbox", { name: "Location" })).fill("Google Meet");
    await page.getByRole("textbox", { name: "Description" }).fill("A 30-minute chat about your project.");
    await page.getByRole("button", { name: "Create event type" }).click();
    await page.getByRole("link", { name: `/meet/${handle}/intro` }).waitFor();
    await page.goto(`/meet/${handle}/intro`);
    await page.getByRole("button", { name: /^\d{1,2}:\d{2}\s?(AM|PM)$/ }).first().waitFor();
    await shoot(page, "schedule");
  }

  // Board: a realistic board.
  {
    const page = await (await browser.newContext({ baseURL: base, ...frame(1152) })).newPage();
    await page.goto("/board");
    await page.getByRole("textbox", { name: "New board name" }).fill("Website relaunch");
    await page.getByRole("button", { name: "Create board" }).click();
    await page.getByRole("heading", { name: "Website relaunch" }).waitFor();
    // Replace the tip cards with project cards.
    const todo = page.getByRole("region", { name: "To do" });
    while ((await todo.getByRole("button", { name: /Drag|Keyboard|Click|Share/ }).count()) > 0) {
      await todo.getByRole("button", { name: /Drag|Keyboard|Click|Share/ }).first().click();
      await page.getByRole("button", { name: "Delete" }).click();
    }
    const cards = {
      "To do": ["Write case studies", "Set up analytics", "Collect testimonials", "Record a demo video", "Plan v3"],
      Doing: ["Homepage hero copy", "Responsive nav", "Screenshot script"],
      Done: ["Scheduler", "Expense tracker", "Kanban board", "Move to Node 24", "Upgrade ESLint"],
    };
    for (const [column, titles] of Object.entries(cards)) {
      const col = page.getByRole("region", { name: column });
      await col.getByRole("button", { name: "Add card" }).click();
      for (const t of titles) {
        await col.getByRole("textbox", { name: "Card title" }).fill(t);
        await col.getByRole("button", { name: "Add", exact: true }).click();
      }
      await col.getByRole("button", { name: "Done", exact: true }).click();
    }
    await page.getByText("All changes saved").waitFor();
    await page.waitForTimeout(500);
    await shoot(page, "board");
  }

  // Expenses: dashboard with sample data.
  {
    const page = await (await browser.newContext({ baseURL: base, ...frame(1280) })).newPage();
    await page.goto("/expenses");
    await page.getByRole("button", { name: "Load sample data" }).click();
    await page.getByText(/^Spent in /).waitFor();
    await shoot(page, "expenses");
  }
  console.log("Saved screenshots to src/content/screens/");
} finally {
  await browser.close();
  server.kill();
}
