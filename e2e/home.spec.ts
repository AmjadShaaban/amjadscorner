import { expect, test } from "@playwright/test";

const apps = [
  { name: "Scheduler", path: "/schedule", how: "/how/schedule" },
  { name: "Board", path: "/board", how: "/how/board" },
  { name: "Expenses", path: "/expenses", how: "/how/expenses" },
];

test("each app on the homepage links to the app and its write-up", async ({ page }) => {
  for (const app of apps) {
    await page.goto("/");
    await page.getByRole("link", { name: `Open ${app.name}` }).click();
    await expect(page).toHaveURL(app.path);

    await page.goto("/");
    const article = page.getByRole("article").filter({ has: page.getByRole("heading", { name: app.name }) });
    await article.getByRole("link", { name: "How it's built" }).click();
    await expect(page).toHaveURL(app.how);
    await expect(page.getByRole("heading", { level: 1, name: `How ${app.name} is built` })).toBeVisible();
    await expect(page.getByRole("heading", { name: "How it's tested" })).toBeVisible();
  }
});

test("the command palette opens with the keyboard and navigates", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.keyboard.press("ControlOrMeta+k");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await page.keyboard.type("expenses is built");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL("/how/expenses");
});

test("the palette button works without a keyboard shortcut", async ({ page }) => {
  await page.goto("/how/board");
  await page.getByRole("button", { name: /Search and commands/ }).click();
  await page.getByRole("option", { name: /^Board$/ }).click();
  await expect(page).toHaveURL("/board");
});

// The root layout streams, so the status is already 200 when notFound() runs; Next.js
// renders the 404 page and marks it noindex instead (see docs: streaming#status-codes).
test("unknown write-ups show the 404 page and aren't indexable", async ({ page }) => {
  await page.goto("/how/nope");
  await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
  await expect(page.locator('meta[name="robots"][content*="noindex"]').first()).toBeAttached();
});
