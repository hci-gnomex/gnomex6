import { expect, test } from '@playwright/test';
import { guestLogin, login, openLoginPage, requireCredentials } from './helpers';

test.describe('login page', () => {
  test('shows the sign-in form', async ({ page }) => {
    await openLoginPage(page);
    await expect(page).toHaveTitle(/Sign In/);
    await expect(page.getByLabel('Username', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute('type', 'password');
  });

  test('redirects to sign-in when not logged in', async ({ page }) => {
    await page.goto('experiments');
    await page.waitForURL(/\/authenticate/);
    await expect(page.getByRole('button', { name: 'Login', exact: true })).toBeVisible();
  });

  test('rejects an unknown user', async ({ page }) => {
    // A made-up account, so failed attempts can't lock out a real user.
    await openLoginPage(page);
    await page.getByLabel('Username', { exact: true }).fill(`e2e-no-such-user-${Date.now()}`);
    await page.getByLabel('Password', { exact: true }).fill('Not-A-Real-Pa55word!');
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    await expect(page.getByText('Authentication Failed')).toBeVisible();
    await expect(page).toHaveURL(/\/authenticate/);
    expect(await page.evaluate(() => localStorage.getItem('gnomex-jwt'))).toBeNull();
  });

  test('guest login opens the app with public access', async ({ page }) => {
    await guestLogin(page);

    await expect(page).toHaveTitle(/Home/);
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
    await expect(page.getByText('Guest privileges only')).toBeVisible();
  });
});

test.describe('signing in and out', () => {
  // login() also skips if the account would go through Duo on this server.
  test.beforeEach(() => requireCredentials());

  test('a valid user lands on the home page', async ({ page }) => {
    await login(page);

    await expect(page).toHaveTitle(/Home/);
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Account menu' })).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('gnomex-jwt'))).toBeTruthy();
  });

  test('the session survives a page reload', async ({ page }) => {
    await login(page);
    await page.reload();
    await expect(page.locator('#main-nav')).toBeVisible({ timeout: 60_000 });
    await expect(page).not.toHaveURL(/\/authenticate/);
  });

  test('signing out returns to the login page', async ({ page }) => {
    await login(page);

    await page.getByRole('button', { name: 'Account menu' }).click();
    await page.getByRole('menuitem', { name: 'Sign out' }).click();
    const confirm = page.getByRole('alertdialog');
    await expect(confirm.getByText('Are you sure you want to sign out?')).toBeVisible();
    await confirm.getByRole('button', { name: 'Yes', exact: true }).click();

    await page.waitForURL(/\/authenticate/, { timeout: 60_000 });
    await expect(page.getByRole('button', { name: 'Login', exact: true })).toBeVisible();

    // The old session must not get back in.
    await page.goto('home');
    await page.waitForURL(/\/authenticate/);
  });
});
