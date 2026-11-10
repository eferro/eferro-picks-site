import { defineConfig, devices } from '@playwright/test';

/**
 * E2E test configuration.
 *
 * Validates real user flows in a browser against the production build
 * (dist/), served like GitHub Pages: under /eferro-picks-site/ and with
 * 404.html as the fallback that makes deep links work.
 * Run via `make test-e2e`, which builds first.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:4173',
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
    command: 'node e2e/pages-server.mjs 4173',
    url: 'http://localhost:4173/eferro-picks-site/',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
