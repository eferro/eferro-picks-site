import { defineConfig, devices } from '@playwright/test';

/**
 * E2E test configuration.
 *
 * Validates real user flows in a browser against the Vite dev server,
 * which is started automatically (reused if already running locally).
 * Run via `make test-e2e`.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173/eferro-picks-site/',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
