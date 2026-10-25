import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

// Next keeps visited pages mounted but hidden, so query by role (accessibility tree,
// visible only) rather than by label, which can match a hidden page's field.

test("sample data fills the dashboard, months navigate, and CSV exports", async ({ page }) => {
  await page.goto("/expenses");
  await page.getByRole("button", { name: "Load sample data" }).click();

  await expect(page.getByText(/^Spent in /)).toBeVisible();
  await expect(page.getByText("Last six months. Select a month to view it.")).toBeVisible();
  await expect(page.getByRole("row").filter({ hasText: "Whole Foods Market" }).first()).toBeVisible();

  const heading = page.getByText(/^Spent in /);
  const before = await heading.textContent();
  await page.getByRole("link", { name: "Previous month" }).click();
  await expect(heading).not.toHaveText(before!);

  const download = page.waitForEvent("download");
  await page.getByRole("link", { name: "Export CSV" }).click();
  const csv = await readFile((await (await download).path())!, "utf8");
  expect(csv.split("\r\n")[0]).toBe("Date,Merchant,Category,Amount,Currency,Notes");
  expect(csv).toContain("Whole Foods Market");
});

test("add, edit and delete an expense by hand", async ({ page }) => {
  const merchant = `Test Merchant ${Date.now().toString(36)}`;
  await page.goto("/expenses/new");
  await page.getByRole("textbox", { name: "Merchant" }).fill(merchant);
  await page.getByRole("textbox", { name: "Amount (USD)" }).fill("12.5");
  await page.getByRole("combobox", { name: "Category" }).selectOption("Dining");
  await page.getByRole("button", { name: "Save expense" }).click();

  await expect(page).toHaveURL(/\/expenses\?month=/);
  const row = page.getByRole("row").filter({ hasText: merchant });
  await expect(row).toContainText("$12.50");

  await row.getByRole("link", { name: merchant }).click();
  await page.getByRole("textbox", { name: "Amount (USD)" }).fill("15");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("row").filter({ hasText: merchant })).toContainText("$15.00");

  await page.getByRole("link", { name: merchant }).click();
  await page.getByRole("button", { name: "Delete" }).click();
  await page.getByRole("button", { name: "Yes, delete" }).click();
  await expect(page).toHaveURL(/\/expenses\?month=/);
  await expect(page.getByRole("link", { name: merchant })).toHaveCount(0);

  // Next keeps the earlier "Add expense" page mounted; it must not show the old draft.
  await page.getByRole("link", { name: "Add expense" }).click();
  await expect(page.getByRole("textbox", { name: "Merchant" })).toHaveValue("");
});

test("scanning a receipt pre-fills the form in the browser and keeps the image private", async ({ page, browser }) => {
  test.setTimeout(90_000); // first run downloads the OCR model

  // Render a receipt and photograph it, so the test needs no binary fixture.
  const camera = await browser.newPage();
  await camera.setViewportSize({ width: 420, height: 520 });
  await camera.setContent(`
    <body style="margin:0;background:#fff;font:22px/1.5 'Courier New',monospace;color:#000;padding:28px">
      <div>WHOLE FOODS MARKET</div>
      <div>123 MAIN ST AUSTIN TX</div>
      <div>&nbsp;</div>
      <div>BANANAS&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1.99</div>
      <div>ALMOND MILK&nbsp;&nbsp;&nbsp;&nbsp;4.49</div>
      <div>SUBTOTAL&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;6.48</div>
      <div>TAX&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0.53</div>
      <div>TOTAL&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;7.01</div>
      <div>&nbsp;</div>
      <div>10/21/2026 14:32</div>
    </body>`);
  const photo = await camera.screenshot({ type: "png" });
  await camera.close();

  await page.goto("/expenses/new");
  await page.getByLabel("Receipt photo").setInputFiles({ name: "receipt.png", mimeType: "image/png", buffer: photo });

  await expect(page.getByText(/Filled in the/)).toBeVisible({ timeout: 75_000 });
  await expect(page.getByRole("textbox", { name: "Merchant" })).toHaveValue("Whole Foods Market");
  await expect(page.getByRole("textbox", { name: "Amount (USD)" })).toHaveValue("7.01");
  await expect(page.getByRole("textbox", { name: "Date" })).toHaveValue("2026-10-21");
  await expect(page.getByRole("combobox", { name: "Category" })).toHaveValue("Groceries");

  await page.getByRole("button", { name: "Save expense" }).click();
  await expect(page).toHaveURL(/month=2026-10/);
  const row = page.getByRole("row").filter({ hasText: "Whole Foods Market" }).filter({ hasText: "$7.01" });
  await expect(row.getByLabel("Has receipt")).toBeVisible();

  await row.getByRole("link", { name: "Whole Foods Market" }).click();
  const img = page.getByRole("img", { name: "Receipt" });
  await expect(img).toBeVisible();
  // The browser actually decoded it, i.e. the owner's request was served.
  await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
  const receiptUrl = new URL((await img.getAttribute("src"))!, page.url()).toString();

  // A different visitor can't fetch it, even with the URL.
  const stranger = await browser.newContext();
  expect((await stranger.request.get(receiptUrl)).status()).toBe(404);
  await stranger.close();
});
