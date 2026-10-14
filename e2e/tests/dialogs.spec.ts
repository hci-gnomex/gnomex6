import { expect, Page, Request, test } from '@playwright/test';
import { browsePages, enterApp, openBrowsePage } from './browse-pages';
import { waitForSpinner } from './helpers';

// Header dialogs and the browse filter's date menu. Read-only: dialogs are opened and cancelled,
// nothing is sent or saved.

const experiments = browsePages.find(p => p.name === 'experiments')!;

test.beforeEach(async ({ page }) => {
  await enterApp(page);
});

test('looking up an unknown experiment number explains the problem', async ({ page }) => {
  const search = page.getByRole('search', { name: 'Header search' });
  await search.getByRole('textbox', { name: 'Lookup by experiment number' }).fill('99999999R');
  await search.getByRole('button', { name: 'Search by number' }).click();

  const error = page.getByRole('alertdialog', { name: 'ERROR' });
  // The server says "Request number 99999999R does not exists".
  await expect(error).toContainText(/Request number 99999999R does not exist/);
  await page.getByRole('dialog', { name: 'ERROR' }).getByRole('button', { name: 'Ok' }).click();
  await expect(error).toBeHidden();
  await expect(page).toHaveURL(/\/home/);
});

test('Report Problem opens a feedback form that can be cancelled without sending', async ({ page }) => {
  const sent: Request[] = [];
  page.on('request', r => { if (r.method() === 'POST' && /mail|feedback|problem/i.test(r.url())) sent.push(r); });

  await page.getByRole('banner').getByRole('button', { name: 'Report Problem' }).click();
  const dialog = page.getByRole('dialog', { name: 'Send Email to GNomEx Team' }).first();
  await expect(dialog.getByRole('heading', { name: 'Send Email to GNomEx Team' })).toBeVisible();
  await expect(dialog.getByRole('textbox', { name: 'Email address' })).toBeVisible();
  await expect(dialog.getByRole('textbox', { name: 'Feedback' })).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Send Email' })).toBeVisible();

  // Seen 2026-10: the embedded page screenshot makes the dialog taller than a 720px-high window and
  // it doesn't scroll, so Send Email and Cancel are below the bottom edge and can't be clicked.
  await expect.soft(dialog.getByRole('button', { name: 'Cancel', exact: true }), 'Cancel should be reachable on screen')
    .toBeInViewport();
  await dialog.getByRole('button', { name: 'Close dialog' }).click();
  await expect(dialog).toBeHidden();
  expect(sent.map(r => r.url()), 'cancelling must not send anything').toEqual([]);
});

test('Contact Us lists email links and closes', async ({ page }) => {
  await page.getByRole('button', { name: 'Help menu' }).click();
  await page.getByRole('menuitem', { name: 'Contact Us' }).click();
  const dialog = page.getByRole('dialog', { name: 'Contact Us' }).first();
  await expect(dialog.getByRole('heading', { name: 'Contact Us' })).toBeVisible();

  const links = dialog.getByRole('link');
  await expect(links.first()).toBeVisible();
  const hrefs = await links.evaluateAll(els => els.map(e => e.getAttribute('href') || ''));
  expect(hrefs.length).toBeGreaterThan(0);
  for (const href of hrefs) {
    expect(href, 'contact links should be email links').toMatch(/^mailto:[^@\s]+@[^@\s]+\.[a-z]+$/i);
  }

  await dialog.getByRole('button', { name: 'Close dialog' }).click();
  await expect(dialog).toBeHidden();
});

/** Waits for the next experiments list request after `action`, pressing Search if none comes. */
async function nextListRequest(page: Page, action: () => Promise<void>): Promise<string> {
  const listed = page.waitForRequest(r => r.url().includes(experiments.listEndpoint), { timeout: 5_000 });
  await action();
  const request = await listed.catch(async () => {
    const again = page.waitForRequest(r => r.url().includes(experiments.listEndpoint));
    await page.getByRole('search', { name: 'Browse filter' }).getByRole('button', { name: 'Search', exact: true }).click();
    return again;
  });
  await waitForSpinner(page);
  return request.url();
}

test('the date filter narrows the experiments list and can be cleared', async ({ page }) => {
  await openBrowsePage(page, experiments);
  const filter = page.getByRole('search', { name: 'Browse filter' });
  const dateButton = filter.getByRole('button', { name: 'Date range filter' });

  await dateButton.click();
  const menu = page.getByRole('menu', { name: 'Date range options' });
  await expect(menu.getByRole('menuitem')).toHaveText(
    ['Last week', 'Last 30 days', 'Last 90 days', 'Last year', 'From year...', 'Custom dates', 'Clear filter']);

  const withDates = await nextListRequest(page, () => menu.getByRole('menuitem', { name: 'Filter by last year' }).click());
  expect(withDates).toMatch(/createDateFrom=[^&]+/);
  expect(withDates).toMatch(/createDateTo=[^&]+/);

  await dateButton.click();
  const cleared = await nextListRequest(page, () => menu.getByRole('menuitem', { name: 'Clear date filter' }).click());
  expect(cleared).not.toContain('createDateFrom');
});
