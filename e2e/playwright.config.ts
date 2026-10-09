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
    // Loads each browse list once so a cold server doesn't time out the first app tests.
    { name: 'setup', testMatch: /\.setup\.ts$/ },
    {
      name: 'login',
      testMatch: /login\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], channel: browserChannel() },
    },
    {
      // Everything read-only inside the app: browse, detail pages, header, topics, protocols.
      // Each test signs in (or enters as a guest) itself; see browse-pages.ts enterApp.
      name: 'app',
      testMatch: /\.spec\.ts$/,
      testIgnore: [/login\.spec\.ts/, /\.write\.spec\.ts$/],
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], channel: browserChannel() },
    },
    {
      // Create/edit tests. They change data, so they skip unless GNOMEX_ALLOW_WRITES=yes and the
      // server is on localhost (a throwaway database); see write-helpers.ts.
      name: 'writes',
      testMatch: /\.write\.spec\.ts$/,
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], channel: browserChannel() },
    },
  ],
});
