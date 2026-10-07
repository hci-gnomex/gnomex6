import { test as setup } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { AUTH_STATE } from '../playwright.config';
import { credentials, login, requireCredentials } from './helpers';

setup('sign in once for the browse tests', async ({ page }) => {
  requireCredentials();
  await login(page);
  // Saves the session cookie and the gnomex-jwt token from localStorage.
  fs.mkdirSync(path.dirname(AUTH_STATE), { recursive: true });
  await page.context().storageState({ path: AUTH_STATE });
  setup.info().annotations.push({ type: 'user', description: credentials.username });
});
