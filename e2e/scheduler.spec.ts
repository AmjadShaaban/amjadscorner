import { expect, test, type Browser, type Page } from "@playwright/test";

const slotButton = /^\d{1,2}:\d{2}\s?(AM|PM)$/;

const newHandle = () => `e2e-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

async function setUpHost(page: Page, handle = newHandle()) {
  await page.goto("/schedule");
  await page.getByLabel("Your name").fill("E2E Host");
  await page.getByLabel("Booking link").fill(handle);
  await page.getByLabel("Time zone").selectOption("America/New_York");
  await page.getByRole("button", { name: "Create my booking page" }).click();
  await expect(page.getByText(`/meet/${handle}`, { exact: true })).toBeVisible();

  await page.getByLabel("Title").fill("Intro call");
  await page.getByLabel("URL").fill("intro");
  await page.getByLabel("Minimum notice").selectOption("0");
  await page.getByRole("button", { name: "Create event type" }).click();
  await expect(page.getByRole("link", { name: `/meet/${handle}/intro` })).toBeVisible();
  return handle;
}

async function openBookingForm(browser: Browser, handle: string, name: string) {
  const context = await browser.newContext({ timezoneId: "Europe/London" });
  const page = await context.newPage();
  await page.goto(`/meet/${handle}/intro`);
  await page.getByRole("button", { name: slotButton }).first().click();
  await page.getByLabel("Name").fill(name);
  await page.getByLabel("Email").fill(`${name.toLowerCase()}@example.com`);
  return page;
}

test("a guest host publishes a page, an invitee books it and then cancels", async ({ page, browser }) => {
  const handle = await setUpHost(page);

  const invitee = await openBookingForm(browser, handle, "Sam");
  await invitee.getByRole("button", { name: "Confirm booking" }).click();
  await expect(invitee.getByText("You're booked")).toBeVisible();
  // Times are shown in the invitee's zone, not the host's.
  await expect(invitee.getByText(/GMT|BST/)).toBeVisible();

  await page.reload();
  await expect(page.getByText("Sam · Intro call")).toBeVisible();

  await invitee.getByRole("button", { name: "Cancel booking" }).click();
  await invitee.getByRole("button", { name: "Yes, cancel" }).click();
  await expect(invitee.getByText("Cancelled", { exact: true })).toBeVisible();

  await page.reload();
  await expect(page.getByText("No bookings yet")).toBeVisible();
});

// Public pages read the profile per request: a handle visited before it existed must
// show up once the host creates it.
test("public booking pages show a profile created after a visit", async ({ page }) => {
  const handle = newHandle();
  for (const path of [`/meet/${handle}`, `/meet/${handle}/intro`]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
  }

  await setUpHost(page, handle);

  await page.goto(`/meet/${handle}`);
  await expect(page.getByRole("heading", { name: "E2E Host" })).toBeVisible();
  await page.getByRole("link", { name: /Intro call/ }).click();
  await expect(page.getByRole("heading", { name: "Intro call" })).toBeVisible();
  await expect(page.getByRole("button", { name: slotButton }).first()).toBeVisible();
});

test("two invitees racing for the same slot: exactly one gets it", async ({ page, browser }) => {
  const handle = await setUpHost(page);
  const [a, b] = await Promise.all([
    openBookingForm(browser, handle, "Alice"),
    openBookingForm(browser, handle, "Bob"),
  ]);

  await Promise.all([
    a.getByRole("button", { name: "Confirm booking" }).click(),
    b.getByRole("button", { name: "Confirm booking" }).click(),
  ]);

  const outcome = async (p: Page) => {
    const booked = p.getByText("You're booked");
    const taken = p.getByText("that time was just booked");
    // Two bookings at once on a busy CI machine can take a while.
    await expect(booked.or(taken)).toBeVisible({ timeout: 15_000 });
    return (await booked.isVisible()) ? "booked" : "taken";
  };
  expect([await outcome(a), await outcome(b)].sort()).toEqual(["booked", "taken"]);
});
