import { expect, Page, Request, test } from '@playwright/test';
import { credentials, login, requireCredentials, waitForSpinner } from './helpers';
import { expectNoErrorDialog } from './tree-helpers';

// Account › My Account. Read-only: fields are changed only to see the form react, and the page is
// left without pressing Save (any save request fails the test).

test.beforeEach(async ({ page }) => {
  requireCredentials();
  await login(page);
});

/** Opens My Account from the Account menu and waits for the user's details to load. */
async function openMyAccount(page: Page) {
  const loaded = page.waitForResponse(r => /GetAppUserPublic\.gx/.test(r.url()));
  await page.getByRole('button', { name: 'Account menu' }).click();
  await page.getByRole('menuitem', { name: 'My Account' }).click();
  await loaded;
  await waitForSpinner(page);
  const form = page.getByRole('main', { name: 'My Account' });
  await expect(form.getByRole('heading', { name: 'My Account' })).toBeVisible();
  await expect(form.getByRole('textbox', { name: 'First Name' })).not.toHaveValue('');
  return form;
}

/** Records calls to server Save commands (SaveAppUserPublic.gx...), not e.g. the Save icon image. */
function forbidSaving(page: Page): Request[] {
  const saves: Request[] = [];
  page.on('request', r => { if (/\/Save\w*\.gx/i.test(new URL(r.url()).pathname)) saves.push(r); });
  return saves;
}

test('My Account shows the signed-in user\'s details', async ({ page }) => {
  const saves = forbidSaving(page);
  const form = await openMyAccount(page);
  await expect(page).toHaveTitle('My Account — GNomEx');
  await expect(form.getByRole('textbox', { name: 'Last Name' })).not.toHaveValue('');
  await expect(form.getByRole('textbox', { name: 'Email' })).toHaveValue(/^[^@\s]+@[^@\s]+\.[a-z]+$/i);
  const type = form.getByRole('radiogroup', { name: 'User type' });
  await expect(type.getByRole('radio', { checked: true })).toHaveCount(1);
  // External users sign in with a user name; university users with their uNID.
  const userName = form.getByRole('textbox', { name: 'User Name' });
  if (await userName.isVisible()) {
    await expect(userName).toHaveValue(credentials.username);
  }
  await expectNoErrorDialog(page);
  expect(saves.map(r => r.url())).toEqual([]);
});

test('My Account never fills in the real password', async ({ page }) => {
  const form = await openMyAccount(page);
  const password = form.getByLabel('Password', { exact: true });
  test.skip(!(await password.isVisible()), 'university users have no password here (they use their uNID)');
  await expect(password).toHaveAttribute('type', 'password');
  // Compared as true/false so a failure can never print the password.
  const shown = await password.inputValue();
  expect(shown === credentials.password, 'the password box must hold a placeholder, not the real password').toBe(false);
  const confirm = await form.getByLabel('Confirm Password', { exact: true }).inputValue();
  expect(confirm === credentials.password, 'nor the confirm box').toBe(false);
});

test('My Account will not save a form with missing or mismatched fields', async ({ page }) => {
  const saves = forbidSaving(page);
  const form = await openMyAccount(page);
  const save = form.getByRole('button', { name: /Save/ });
  await expect(save).toBeEnabled();

  const firstName = form.getByRole('textbox', { name: 'First Name' });
  const original = await firstName.inputValue();
  await firstName.fill('');
  await expect(save, 'First Name is required').toBeDisabled();
  await firstName.fill(original);
  await expect(save).toBeEnabled();

  const email = form.getByRole('textbox', { name: 'Email' });
  const originalEmail = await email.inputValue();
  await email.fill('not-an-email');
  await expect(save, 'the email must look like an address').toBeDisabled();
  await email.fill(originalEmail);
  await expect(save).toBeEnabled();

  const confirm = form.getByLabel('Confirm Password', { exact: true });
  if (await confirm.isVisible()) {
    await confirm.fill('e2e-does-not-match');
    await expect(save, 'the two passwords must match').toBeDisabled();
  }

  // Leave without saving.
  await page.getByRole('link', { name: 'GNomEx home' }).click();
  await expect(page).toHaveURL(/\/home/);
  expect(saves.map(r => r.url()), 'nothing should have been saved').toEqual([]);
});

test('Request Lab Membership opens and can be cancelled without sending', async ({ page }) => {
  const sent: Request[] = [];
  page.on('request', r => {
    if (r.method() === 'POST' || /\/(Save\w*|\w*Membership\w*)\.gx/i.test(new URL(r.url()).pathname)) sent.push(r);
  });
  const form = await openMyAccount(page);
  sent.length = 0;

  await form.getByRole('button', { name: 'Request Membership to Additional Labs' }).click();
  const dialog = page.getByRole('dialog', { name: /Request Lab Membership/ }).first();
  await expect(dialog.getByRole('button', { name: 'Request' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(dialog).toBeHidden();
  expect(sent.map(r => `${r.method()} ${r.url()}`), 'cancelling must not send a request').toEqual([]);
});
