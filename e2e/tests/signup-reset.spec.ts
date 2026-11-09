import { APIResponse, expect, Locator, Page, Request, Response, test } from '@playwright/test';
import { openLoginPage } from './helpers';
import { expectNoErrorDialog } from './tree-helpers';

// Signed out: Reset Password and Sign Up ("New Account"). Read-only: the forms are filled only to see
// them react. Submit is never pressed, and any request that would reset a password or create an
// account fails the test.

/** Records requests that would email a password reset or register a new user. */
function forbidSubmitting(page: Page): Request[] {
  const sent: Request[] = [];
  page.on('request', r => {
    if (/\/(ChangePassword|PublicSaveSelfRegisteredAppUser)\.gx/i.test(new URL(r.url()).pathname)) {
      sent.push(r);
    }
  });
  return sent;
}

/** The data the sign-up pages load (cores, or one core's labs). */
interface NewAccountInfo {
  result: string;
  message?: string;
  CoreFacilities?: { idCoreFacility: string | number; display: string; description?: string }[];
  Labs?: { idLab: string | number; name: string }[];
  isUniversityUserAuthentication?: string;
}

async function readInfo(response: Response | APIResponse): Promise<NewAccountInfo> {
  expect(response.ok(), `${new URL(response.url()).pathname} should succeed`).toBe(true);
  const info: NewAccountInfo = await response.json();
  expect(info.result, `GetNewAccountServlet.gx failed: ${info.message || ''}`).toBe('SUCCESS');
  return info;
}

/** A Material slide toggle: role=switch (older builds: checkbox), named by its label. */
function toggle(scope: Page | Locator, label: string): Locator {
  return scope.getByRole('switch', { name: label, exact: true })
    .or(scope.getByRole('checkbox', { name: label, exact: true }));
}

/**
 * Clicks a Material slide toggle by its label. The real input is visually hidden inside the label,
 * so a click on it would land on the toggle's track instead. Some toggles relabel themselves when
 * flipped ("Lookup by email" becomes "Lookup by username"); pass the new label as `labelAfter`.
 */
async function flip(page: Page, label: string, labelAfter: string = label): Promise<void> {
  const before = await toggle(page, label).isChecked();
  await page.locator('mat-slide-toggle').filter({ hasText: label }).click();
  await expect(toggle(page, labelAfter)).toBeChecked({ checked: !before });
}

/** Types into a field and leaves it, so Material shows its error message (errors appear once touched). */
async function enter(field: Locator, value: string): Promise<void> {
  await field.fill(value);
  await field.blur();
}

/** Opens the core list from the sign-in page's New Account button; skips if sign-up is off. */
async function openCoreList(page: Page): Promise<NewAccountInfo> {
  await openLoginPage(page);
  const newAccount = page.getByRole('button', { name: 'New Account', exact: true });
  test.skip(!(await newAccount.isVisible()), 'this server has user sign-up (or guest access) turned off');
  const loaded = page.waitForResponse(r => r.url().includes('GetNewAccountServlet.gx'));
  await newAccount.click();
  await page.waitForURL(/\/register-user$/);
  return readInfo(await loaded);
}

test('Reset Password opens from sign-in and needs a username or email', async ({ page }) => {
  const sent = forbidSubmitting(page);
  await openLoginPage(page);
  const reset = page.getByRole('button', { name: 'Reset Password', exact: true });
  test.skip(!(await reset.isVisible()), 'the sign-in page offers no Reset Password (guest access is off)');
  await reset.click();
  await page.waitForURL(/\/reset-password$/);
  await expect(page).toHaveTitle('Reset Password — GNomEx');
  await expect(page.getByRole('heading', { name: 'Reset Password' })).toBeVisible();

  const submit = page.getByRole('button', { name: 'Submit', exact: true });
  const username = page.getByRole('textbox', { name: 'Username', exact: true });
  await expect(username).toBeVisible();
  await expect(submit, 'nothing entered yet').toBeDisabled();
  await username.fill('e2e-nobody');
  await expect(submit).toBeEnabled();
  await username.fill('');
  await expect(submit, 'emptied again').toBeDisabled();

  // The toggle switches the lookup from username to email (its label names what it switches to).
  await flip(page, 'Lookup by email', 'Lookup by username');
  await expect(page.getByRole('textbox', { name: 'Email', exact: true })).toBeVisible();
  await expect(username).toHaveCount(0);
  await flip(page, 'Lookup by username', 'Lookup by email');
  await expect(username).toBeVisible();

  await page.getByRole('link', { name: 'Sign in', exact: true }).click();
  await page.waitForURL(/\/authenticate/);
  await expect(page.getByRole('button', { name: 'Login', exact: true })).toBeVisible();
  await expectNoErrorDialog(page);
  expect(sent.map(r => r.url()), 'no reset should be requested').toEqual([]);
});

test('New Account lists the core facilities, each linking to its sign-up form', async ({ page }) => {
  const sent = forbidSubmitting(page);
  const info = await openCoreList(page);
  await expect(page).toHaveTitle('Sign Up — GNomEx');
  await expect(page.getByText('Please click on the core of interest to begin.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Sign in', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: /^Reset password/ })).toBeVisible();

  const cores = info.CoreFacilities || [];
  expect(cores.length, 'at least one active core facility to sign up with').toBeGreaterThan(0);
  for (const core of cores) {
    const link = page.getByRole('link', { name: core.display, exact: true });
    await expect.soft(link, `a link for ${core.display}`).toHaveAttribute('href', new RegExp(`/register-user/${core.idCoreFacility}$`));
  }
  await expectNoErrorDialog(page);
  expect(sent.map(r => r.url())).toEqual([]);
});

test('the public sign-up data names labs and cores only, no contact details', async ({ page }) => {
  // These pages are open to anyone, so they must not hand out more than a name to pick.
  const info = await openCoreList(page);
  const core = (info.CoreFacilities || [])[0];
  test.skip(!core, 'no active core facilities');
  const labs = await readInfo(await page.request.get(`GetNewAccountServlet.gx?idCoreFacility=${core.idCoreFacility}`));

  for (const c of info.CoreFacilities || []) {
    expect(Object.keys(c).filter(k => !['idCoreFacility', 'display', 'description'].includes(k)),
      `fields sent for core ${c.idCoreFacility}`).toEqual([]);
  }
  const extra = new Set<string>();
  for (const lab of labs.Labs || []) {
    Object.keys(lab).filter(k => !['idLab', 'name'].includes(k)).forEach(k => extra.add(k));
  }
  // Field names only; their values are never printed.
  expect([...extra], `fields sent for each of ${(labs.Labs || []).length} labs besides idLab and name`).toEqual([]);
});

test('the sign-up form checks its fields and enables Submit only when complete', async ({ page }) => {
  const sent = forbidSubmitting(page);
  const cores = await openCoreList(page);
  const core = (cores.CoreFacilities || [])[0];
  test.skip(!core, 'no active core facilities');
  const loaded = page.waitForResponse(r => r.url().includes('GetNewAccountServlet.gx') && r.url().includes('idCoreFacility='));
  await page.getByRole('link', { name: core.display, exact: true }).click();
  await page.waitForURL(/\/register-user\/\d+$/);
  const info = await readInfo(await loaded);
  await expect(page).toHaveTitle('Sign Up — GNomEx');
  const form = page.locator('form').filter({ has: page.getByRole('heading', { name: 'Sign up for an account' }) });
  await expect(form).toBeVisible();

  const submit = form.getByRole('button', { name: 'Submit', exact: true });
  await expect(submit, 'empty form').toBeDisabled();

  const email = form.getByRole('textbox', { name: 'Email', exact: true });
  await enter(email, 'not-an-email');
  await expect(form.getByText('The email format is invalid')).toBeVisible();
  await enter(email, 'e2e-signup@example.com');
  await expect(form.getByText('The email format is invalid')).toHaveCount(0);

  // University sign-in: university users give their uNID; everyone else picks a username/password.
  const affiliated = toggle(form, 'Affiliated with the University of Utah');
  const uNID = form.getByRole('textbox', { name: 'uNID', exact: true });
  const userName = form.getByRole('textbox', { name: 'User Name', exact: true });
  if (info.isUniversityUserAuthentication === 'Y') {
    await expect(affiliated).toBeChecked();
    await enter(uNID, 'x12');
    await expect(form.getByText('Format should be a "u" followed by 7 digits')).toBeVisible();
    await flip(page, 'Affiliated with the University of Utah');
    await expect(uNID).toHaveCount(0);
  } else {
    // Seen 2026-11: the server's "N" was read as true, so the university switch showed (and was on)
    // anyway; and once off, the hidden uNID stayed required, so Submit could never be enabled.
    // Fixed in RegisterUserComponent.
    await expect(affiliated, 'no university switch without university sign-in').toHaveCount(0);
    await expect(uNID).toHaveCount(0);
  }
  await expect(userName, 'external users choose a username').toBeVisible();

  await enter(userName, 'u1234567');
  await expect(form.getByText('The value cannot be a UID for an external user')).toBeVisible();
  await enter(userName, `e2e-signup-${Date.now().toString(36)}`);

  const password = form.getByLabel('Password', { exact: true });
  const confirm = form.getByLabel('Password (conf)', { exact: true });
  await enter(password, 'short');
  await expect(form.getByText('Invalid password pattern')).toBeVisible();
  // Not a real password: made up per run, never used to sign in.
  const made = `E2e-${Math.random().toString(36).slice(2, 10)}`;
  await enter(password, made);
  await expect(form.getByText('Invalid password pattern')).toHaveCount(0);
  await enter(confirm, `${made}x`);
  await expect(form.getByText("The password doesn't match")).toBeVisible();
  await enter(confirm, made);
  await expect(form.getByText("The password doesn't match")).toHaveCount(0);

  await enter(form.getByRole('textbox', { name: 'First Name', exact: true }), 'E2e');
  await enter(form.getByRole('textbox', { name: 'Last Name', exact: true }), 'Signup');
  await enter(form.getByRole('textbox', { name: 'Phone', exact: true }), '555-0100');
  await expect(submit, 'no lab chosen yet').toBeDisabled();

  // A new lab instead of an existing one, so no real lab is picked.
  await expect(form.getByRole('combobox', { name: 'Choose Lab' })).toBeVisible();
  await flip(page, 'New Lab');
  await enter(form.getByRole('textbox', { name: 'Lab First Name', exact: true }), 'E2e');
  await enter(form.getByRole('textbox', { name: 'Lab Last Name', exact: true }), 'Lab');
  await enter(form.getByRole('textbox', { name: 'PI Email', exact: true }), 'e2e-pi@example.com');
  await enter(form.getByRole('textbox', { name: 'Pi Phone', exact: true }), '555-0101');
  await expect(submit, 'every required field is filled in').toBeEnabled();

  // Back to an existing lab: one must be chosen again.
  await flip(page, 'New Lab');
  await expect(form.getByRole('combobox', { name: 'Choose Lab' })).toBeVisible();
  await expect(submit, 'no lab chosen').toBeDisabled();

  await expectNoErrorDialog(page);
  expect(sent.map(r => r.url()), 'no account should be created').toEqual([]);
});

test('without university sign-in the sign-up form asks for a username and can be completed', async ({ page }) => {
  // Most servers answer one way only, so the core's sign-up data is faked here with "N" (no
  // university sign-in) to check the front end, whatever this server sends.
  // Seen 2026-11: "N" was read as true, so the university switch showed (and was on) anyway; and
  // once off, the hidden uNID stayed required, so Submit could never be enabled. Fixed in
  // RegisterUserComponent.
  const sent = forbidSubmitting(page);
  await page.route(/GetNewAccountServlet\.gx\?.*idCoreFacility=/, route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({ result: 'SUCCESS', Labs: [], isUniversityUserAuthentication: 'N', siteLogo: '' }),
  }));
  await page.goto('register-user/1');
  const form = page.locator('form').filter({ has: page.getByRole('heading', { name: 'Sign up for an account' }) });
  await expect(form).toBeVisible();
  const submit = form.getByRole('button', { name: 'Submit', exact: true });

  await expect(toggle(form, 'Affiliated with the University of Utah'), 'no university switch').toHaveCount(0);
  await expect(form.getByRole('textbox', { name: 'uNID', exact: true })).toHaveCount(0);
  const userName = form.getByRole('textbox', { name: 'User Name', exact: true });
  await expect(userName, 'external users choose a username').toBeVisible();

  const made = `E2e-${Math.random().toString(36).slice(2, 10)}`;
  await enter(form.getByRole('textbox', { name: 'First Name', exact: true }), 'E2e');
  await enter(form.getByRole('textbox', { name: 'Last Name', exact: true }), 'Signup');
  await enter(form.getByRole('textbox', { name: 'Email', exact: true }), 'e2e-signup@example.com');
  await enter(form.getByRole('textbox', { name: 'Phone', exact: true }), '555-0100');
  await enter(userName, `e2e-signup-${Date.now().toString(36)}`);
  await enter(form.getByLabel('Password', { exact: true }), made);
  await enter(form.getByLabel('Password (conf)', { exact: true }), made);
  await flip(page, 'New Lab');
  await enter(form.getByRole('textbox', { name: 'Lab First Name', exact: true }), 'E2e');
  await enter(form.getByRole('textbox', { name: 'Lab Last Name', exact: true }), 'Lab');
  await enter(form.getByRole('textbox', { name: 'PI Email', exact: true }), 'e2e-pi@example.com');
  await enter(form.getByRole('textbox', { name: 'Pi Phone', exact: true }), '555-0101');
  await expect(submit, 'every required field is filled in').toBeEnabled();

  await expectNoErrorDialog(page);
  expect(sent.map(r => r.url()), 'no account should be created').toEqual([]);
});
