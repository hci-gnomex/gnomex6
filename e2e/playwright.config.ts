import { defineConfig, devices, chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Local settings (URL, test account) live in e2e/.env, which is git-ignored. See .env.example.
const envFile = path.join(__dirname, '.env');
if (fs.existsSync(envFile)) {
  process.loadEnvFile(envFile);
}

/** GNomEx root, e.g. http://localhost:8080/gnomex/ (Tomcat) or http://localhost:4200/gnomex/ (ng serve). */
const baseURL = (process.env.GNOMEX_BASE_URL || 'http://localhost:8080/gnomex/').replace(/\/?$/, '/');

// Use Playwright's own Chromium when it has been downloaded (npx playwright install chromium);
// otherwise fall back to an installed Edge/Chrome so tests run on locked-down machines too.
function browserChannel(): string | undefined {
  if (process.env.PW_CHANNEL) {
    return process.env.PW_CHANNEL;
  }
  if (fs.existsSync(chromium.executablePath())) {
    return undefined;
  }
  return process.platform === 'win32' ? 'msedge' : 'chrome';
}

export const AUTH_STATE = path.join(__dirname, '.auth', 'user.json');

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  // initApp makes ~10 backend calls after login, so allow for a slow dev database.
  timeout: 90_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  forbidOnly: !!process.env.CI,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL,
    channel: browserChannel(),
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    ignoreHTTPSErrors: true,
  },
  projects: [
    // Logs in once through the UI and saves cookies + the gnomex-jwt token for the browse tests.
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'login',
      testMatch: /login\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], channel: browserChannel() },
    },
    {
      name: 'browse',
      testMatch: /browse\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        channel: browserChannel(),
        // Without an account the browse tests sign in as a guest instead (see browse.spec.ts).
        storageState: process.env.GNOMEX_USER && process.env.GNOMEX_PASSWORD ? AUTH_STATE : undefined,
      },
    },
  ],
});
