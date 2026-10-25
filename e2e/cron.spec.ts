import { expect, test } from "@playwright/test";

// The e2e server runs with CRON_SECRET=e2e-cron-secret (playwright.config.ts).
test("the cleanup endpoint only runs with the cron secret", async ({ request }) => {
  expect((await request.get("/api/cron/cleanup")).status()).toBe(401);
  expect((await request.get("/api/cron/cleanup", { headers: { Authorization: "Bearer wrong" } })).status()).toBe(401);

  const ok = await request.get("/api/cron/cleanup", { headers: { Authorization: "Bearer e2e-cron-secret" } });
  expect(ok.status()).toBe(200);
  const report = await ok.json();
  expect(report).toMatchObject({ guestsDeleted: expect.any(Number), orphansDeleted: expect.any(Number) });
});
