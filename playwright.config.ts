import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  retries: 0,
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run start",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true,
    timeout: 120000,
  },
  projects: [
    {
      name: "ipad",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 834, height: 1194 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
});
