import { expect, Page, Response, test } from '@playwright/test';
import { enterApp } from './browse-pages';
import { waitForSpinner } from './helpers';
import { expectNoErrorDialog } from './tree-helpers';

// Reports › Project/Experiment Report. Running it only reads data: the report opens in a new tab as
// a spreadsheet, which Playwright keeps in its own temporary folder and deletes.

/** Opens a Reports menu item, or skips if this user has no Reports menu or no such item. */
async function openReport(page: Page, item: string): Promise<void> {
  await enterApp(page);
  const reports = page.locator('#main-nav').getByRole('button', { name: /^Reports( \.\.\.)? menu$/ });
  test.skip(!(await reports.isVisible()), 'this user has no Reports menu');
  await reports.click();
  const entry = page.getByRole('menuitem', { name: item, exact: true });
  test.skip(!(await entry.isVisible()), `this user's Reports menu has no "${item}"`);
  await entry.click();
  await waitForSpinner(page);
  await expect(page.getByRole('heading', { name: item })).toBeVisible();
}

test('the Project/Experiment Report runs and returns a spreadsheet', async ({ page, context }) => {
  await openReport(page, 'Project/Experiment Report');

  // The report opens in a new tab; watch every page in the context for its response.
  const report = new Promise<Response>(resolve => {
    context.on('response', r => { if (r.url().includes('ShowProjectExperimentReport.gx')) resolve(r); });
  });
  const popup = context.waitForEvent('page');
  await page.getByRole('button', { name: 'Run', exact: true }).click();
  await popup;
  const response = await report;

  expect(response.status(), 'the report should be served').toBe(200);
  const type = response.headers()['content-type'] || '';
  const disposition = response.headers()['content-disposition'] || '';
  // A spreadsheet, not GNomEx's HTML error page.
  expect(`${type} ${disposition}`, 'an Excel or CSV file').toMatch(/excel|spreadsheet|csv|\.xlsx?|\.csv/i);
  await expectNoErrorDialog(page);
});
