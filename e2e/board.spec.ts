import { expect, test, type Browser, type Locator, type Page } from "@playwright/test";

// Query by role: Next keeps visited pages mounted but hidden (see CLAUDE.md).
const column = (page: Page, name: string) => page.getByRole("region", { name });
const card = (scope: Page | Locator, title: string) => scope.getByRole("button", { name: title, exact: true });

async function createBoard(page: Page) {
  const name = `Board ${Date.now().toString(36)}`;
  await page.goto("/board");
  await page.getByRole("textbox", { name: "New board name" }).fill(name);
  await page.getByRole("button", { name: "Create board" }).click();
  await expect(page.getByRole("heading", { name })).toBeVisible();
  return name;
}

async function addCard(page: Page, columnName: string, title: string) {
  const col = column(page, columnName);
  await col.getByRole("button", { name: "Add card" }).click();
  await col.getByRole("textbox", { name: "Card title" }).fill(title);
  await col.getByRole("button", { name: "Add", exact: true }).click();
  await col.getByRole("button", { name: "Done" }).click();
  // Wait until the server copy replaced the optimistic one (it becomes draggable).
  await expect(card(col, title)).toHaveAttribute("aria-roledescription", "draggable card");
  await expect(card(col, title)).not.toHaveAttribute("aria-disabled", "true");
}

/** Optimistic UI shows changes before they're stored; wait for the save before reloading. */
async function saved(page: Page) {
  await expect(page.getByText("All changes saved")).toBeVisible();
}

async function drag(page: Page, from: Locator, to: Locator) {
  const a = (await from.boundingBox())!;
  const b = (await to.boundingBox())!;
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  // Several steps: dnd-kit needs real pointer movement past its 6px threshold.
  await page.mouse.move(a.x + a.width / 2 + 10, a.y + a.height / 2, { steps: 5 });
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 15 });
  await page.mouse.up();
}

async function invite(page: Page, browser: Browser, role: "editor" | "viewer") {
  await page.getByRole("button", { name: "Share", exact: true }).click();
  await page.getByRole("combobox", { name: "Role for new link" }).selectOption(role);
  await page.getByRole("button", { name: "Create invite link" }).click();
  const url = await page.getByRole("textbox", { name: "Invite link" }).inputValue();
  await page.keyboard.press("Escape");

  const guest = await (await browser.newContext()).newPage();
  await guest.goto(url.replace(/^https?:\/\/[^/]+/, ""));
  await guest.getByRole("button", { name: "Join board" }).click();
  return guest;
}

test("drag a card to another column with the mouse, undo it, and persist a move", async ({ page }) => {
  await createBoard(page);
  await addCard(page, "To do", "Write tests");

  await drag(page, card(column(page, "To do"), "Write tests"), column(page, "Done"));
  await expect(card(column(page, "Done"), "Write tests")).toBeVisible();
  await saved(page);

  // Undo history lives for this visit, so undo before reloading.
  await page.keyboard.press("ControlOrMeta+z");
  await expect(card(column(page, "To do"), "Write tests")).toBeVisible();
  await saved(page);
  await page.reload();
  await expect(card(column(page, "To do"), "Write tests")).toBeVisible();

  await drag(page, card(column(page, "To do"), "Write tests"), column(page, "Doing"));
  await saved(page);
  await page.reload();
  await expect(card(column(page, "Doing"), "Write tests")).toBeVisible();
});

test("move a card with the keyboard only, with screen reader announcements", async ({ page }) => {
  await createBoard(page);
  await addCard(page, "To do", "Keyboard card");
  const live = page.locator("[id^=DndLiveRegion]");

  await card(column(page, "To do"), "Keyboard card").focus();
  await page.keyboard.press("Space");
  // "Picked up…" is replaced at once by the first position announcement.
  await expect(live).toContainText("Keyboard card is over To do");
  await page.keyboard.press("ArrowRight");
  await expect(live).toContainText("Keyboard card is over the Doing column");
  await page.keyboard.press("Space");
  await expect(live).toContainText("Dropped Keyboard card in Doing, position 1 of 1");

  await expect(card(column(page, "Doing"), "Keyboard card")).toBeVisible();
  await saved(page);
  await page.reload();
  await expect(card(column(page, "Doing"), "Keyboard card")).toBeVisible();
});

test("delete a card and bring it back with Undo", async ({ page }) => {
  await createBoard(page);
  await addCard(page, "Doing", "Temporary");

  await card(column(page, "Doing"), "Temporary").click();
  await page.getByRole("button", { name: "Delete" }).click();
  await expect(card(column(page, "Doing"), "Temporary")).toHaveCount(0);

  await page.getByRole("button", { name: "Undo" }).click();
  await expect(card(column(page, "Doing"), "Temporary")).toBeVisible();
});

test("concurrent edits: the second save sees the first and doesn't overwrite it", async ({ page, browser }) => {
  await createBoard(page);
  await addCard(page, "To do", "Shared card");
  const editor = await invite(page, browser, "editor");

  // Owner opens the card, then the editor changes it first.
  await card(column(page, "To do"), "Shared card").click();
  await card(column(editor, "To do"), "Shared card").click();
  await editor.getByRole("textbox", { name: "Title" }).fill("Editor's title");
  await editor.getByRole("button", { name: "Save" }).click();
  await expect(card(column(editor, "To do"), "Editor's title")).toBeVisible();

  await page.getByRole("textbox", { name: "Title" }).fill("Owner's title");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert")).toContainText("Someone else changed this card");
  await expect(page.getByRole("textbox", { name: "Title" })).toHaveValue("Editor's title");

  // Saving again on top of their version works.
  await page.getByRole("textbox", { name: "Title" }).fill("Owner's title");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(card(column(page, "To do"), "Owner's title")).toBeVisible();
});

test("viewers can't edit, and strangers can't see the board", async ({ page, browser }) => {
  await createBoard(page);
  const viewer = await invite(page, browser, "viewer");

  await expect(viewer.getByText("View only")).toBeVisible();
  await expect(viewer.getByRole("button", { name: "Add card" })).toHaveCount(0);
  await expect(viewer.getByRole("button", { name: "Add column" })).toHaveCount(0);
  await expect(card(column(viewer, "To do"), "Click a card to edit it")).toHaveAttribute("aria-roledescription", "card");

  const stranger = await (await browser.newContext()).newPage();
  const response = await stranger.goto(new URL(page.url()).pathname);
  await expect(stranger.getByRole("heading", { name: "404" })).toBeVisible();
  expect(response?.status()).toBe(200); // streamed page; the not-found UI renders inside it
});
