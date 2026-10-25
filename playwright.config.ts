import { defineConfig, devices } from "@playwright/test";

// Runs against a production build (`npm run build` first; CI does this) on its own port,
// so a `next dev` on :3000 is never mistaken for the server under test.
const PORT = 3100;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL, trace: "retain-on-failure", actionTimeout: 10_000 },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: false,
    env: { BETTER_AUTH_URL: baseURL, CRON_SECRET: "e2e-cron-secret" },
  },
});
