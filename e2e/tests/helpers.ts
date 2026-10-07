import { expect, Page, test } from '@playwright/test';

export const credentials = {
  username: process.env.GNOMEX_USER || '',
  password: process.env.GNOMEX_PASSWORD || '',
};

export const hasCredentials = !!(credentials.username && credentials.password);

/** Skips the calling test (or describe block) when no test account is configured. */
export function requireCredentials(): void {
  test.skip(!hasCredentials, 'Set GNOMEX_USER and GNOMEX_PASSWORD in e2e/.env to run tests that sign in.');
}

/** The subset of GetLoginProperties.gx the tests care about. */
export interface LoginProperties {
  no_guest_access?: boolean;
  useduo?: string;
  duoExceptions?: string;
}

/**
 * Same rule as the login page and DuoEligibility: u-numbers go through Duo when the server has Duo
 * on, unless they're listed in duoExceptions. A test can't complete Duo, so it must not try.
 */
export function requiresDuo(username: string, props: LoginProperties): boolean {
  const name = username.trim();
  if (props.useduo !== 'yes' || !/^[uU]\d{7,8}$/.test(name)) {
    return false;
  }
  const exceptions = (props.duoExceptions || '').split(/[;,\s]+/).map(u => u.toLowerCase());
  return !exceptions.includes(name.toLowerCase());
}

/** Opens the sign-in page and returns the server's login settings (guest access, Duo). */
export async function openLoginPage(page: Page): Promise<LoginProperties> {
  const propsResponse = page.waitForResponse(r => r.url().includes('GetLoginProperties.gx'));
  await page.goto('authenticate');
  await expect(page.getByRole('button', { name: 'Login', exact: true })).toBeVisible();
  return (await propsResponse).json();
}

/** Signs in through the login form and waits until the app has finished loading. */
export async function login(page: Page, username = credentials.username, password = credentials.password): Promise<void> {
  const props = await openLoginPage(page);
  // Checked before the password is typed, so a Duo account never gets a push from a test run.
  test.skip(requiresDuo(username, props),
    `${username} would go through Duo on this server; use an external or Duo-exempt account.`);

  // The labels are added in a setTimeout after render; getByLabel waits for them.
  await page.getByLabel('Username', { exact: true }).fill(username);
  await page.getByLabel('Password', { exact: true }).fill(password);

  const session = page.waitForResponse(r => r.url().includes('/api/user-session') && r.request().method() === 'POST');
  // The Login button has no type=submit, so Enter does nothing; click it.
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  const response = await session;
  expect(response.status(), 'POST api/user-session should return 201 for a valid account').toBe(201);

  await waitForAppReady(page);
}

/** Enters as a guest (public data only). Skips the test if the server has guest access turned off. */
export async function guestLogin(page: Page): Promise<void> {
  const props = await openLoginPage(page);
  test.skip(props.no_guest_access !== false, 'Guest access is disabled on this server; set GNOMEX_USER/GNOMEX_PASSWORD.');
  await page.getByRole('button', { name: 'Guest Login', exact: true }).click();
  await waitForAppReady(page);
}

/** /home shows a progress bar while initApp runs; the header nav only renders once it's done. */
export async function waitForAppReady(page: Page): Promise<void> {
  await page.waitForURL(/\/home(\?|$)/);
  await expect(page.locator('#main-nav')).toBeVisible({ timeout: 60_000 });
  await expect(page.locator('gnomex-home mat-progress-bar')).toHaveCount(0);
}

/** Waits for the modal "Please wait..." spinner that opens after clicking a tree node. */
export async function waitForSpinner(page: Page): Promise<void> {
  await expect(page.locator('spinner-dialog')).toHaveCount(0, { timeout: 60_000 });
}

/**
 * Opens a top-level browse page from the header. Depending on the user's role an item is either a
 * plain button ("Analysis") or a menu ("Experiments menu" > "Browse Experiments").
 */
export async function openFromNav(page: Page, item: string, menuItem?: string): Promise<void> {
  const nav = page.locator('#main-nav');
  const menuButton = nav.getByRole('button', { name: `${item} menu`, exact: true });
  if (menuItem && await menuButton.isVisible()) {
    await menuButton.click();
    await page.getByRole('menuitem', { name: menuItem, exact: true }).click();
  } else {
    await nav.getByRole('button', { name: item, exact: true }).click();
  }
}
