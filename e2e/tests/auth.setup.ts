import { test as setup } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { AUTH_STATE } from '../playwright.config';
import { browsePages, enterApp, openBrowsePage } from './browse-pages';
import { credentials, hasCredentials, login, requireCredentials } from './helpers';

setup('sign in once for the browse tests', async ({ page }) => {
  requireCredentials();
  await login(page);
  // Saves the session cookie and the gnomex-jwt token from localStorage.
  fs.mkdirSync(path.dirname(AUTH_STATE), { recursive: true });
  await page.context().storageState({ path: AUTH_STATE });
  setup.info().annotations.push({ type: 'user', description: credentials.username });
});

// The first list query after Tomcat starts can take well over a minute (seen: >90 s for the
// experiments list, then ~15 s), which made the first browse test time out. Load each list once
// here with a generous limit so the browse tests start against a warm server. This is best-effort:
// a slow list is reported, not failed, so the browse tests still run and report real problems.
const WARM_UP_LIST_LIMIT = 3 * 60_000;

setup('warm up the server before the browse tests', async ({ browser }) => {
  setup.setTimeout(4 * WARM_UP_LIST_LIMIT);
  // Runs after the sign-in step above, so the saved session exists when there's an account.
  const context = await browser.newContext(hasCredentials ? { storageState: AUTH_STATE } : {});
  const page = await context.newPage();
  const note = (description: string) => {
    console.log(`warm-up: ${description}`);
    setup.info().annotations.push({ type: 'warm-up', description });
  };
  try {
    await enterApp(page);
    for (const p of browsePages) {
      const start = Date.now();
      try {
        await openBrowsePage(page, p, WARM_UP_LIST_LIMIT);
        note(`${p.name} list loaded in ${((Date.now() - start) / 1000).toFixed(1)} s`);
      } catch {
        // A list still loading leaves a modal spinner over the page, so stop rather than
        // clicking the header behind it.
        note(`${p.name} list didn't load within ${WARM_UP_LIST_LIMIT / 1000} s; skipping the rest of the warm-up`);
        break;
      }
    }
  } finally {
    await context.close();
  }
});
