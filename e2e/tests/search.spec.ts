import { expect, Locator, Page, test } from '@playwright/test';
import { enterApp } from './browse-pages';
import { waitForSpinner } from './helpers';
import { expectNoErrorDialog } from './tree-helpers';

// The header's text search and its Advanced Search results. Read-only.

const TERM = process.env.GNOMEX_SEARCH_TERM || 'RNA';
const CATEGORIES = ['Experiments', 'Analysis', 'Protocols', 'Data Tracks', 'Topics'];

/** Searches from the header and returns the Advanced Search dialog showing the results. */
async function search(page: Page, term: string = TERM): Promise<Locator> {
  await enterApp(page);
  const box = page.getByRole('search', { name: 'Header search' });
  await box.getByRole('textbox', { name: 'Search by text' }).fill(term);
  const response = page.waitForResponse(r => r.url().includes('SearchIndex.gx'));
  await box.getByRole('button', { name: 'Submit text search' }).click();
  const body = await (await response).text();
  // Servers without a Lucene index answer with an error; header.spec.ts reports that case.
  test.skip(/luceneIndex|does not exist/i.test(body), 'this server has no search index (build it with scripts/index_gnomex.*)');
  await waitForSpinner(page);
  const dialog = page.getByRole('dialog', { name: 'Advanced Search' }).last();
  await expect(dialog.getByRole('tab', { name: 'Search Results', exact: true, selected: true })).toBeVisible();
  await expectNoErrorDialog(page);
  return dialog;
}

/** Reads the hit count from a filter button such as "Experiments, 12 hits". */
async function hits(dialog: Locator, category: string): Promise<number> {
  const button = dialog.getByRole('toolbar', { name: 'Filter search results' })
    .getByRole('button', { name: new RegExp(`^${category}, \\d+ hits$`) });
  const label = (await button.getAttribute('aria-label')) || '';
  return Number(label.match(/(\d+) hits$/)![1]);
}

test('the result counts add up', async ({ page }) => {
  const dialog = await search(page);
  const all = await hits(dialog, 'All Results');
  expect(all, `"${TERM}" should find something; set GNOMEX_SEARCH_TERM`).toBeGreaterThan(0);
  let sum = 0;
  for (const category of CATEGORIES) {
    sum += await hits(dialog, category);
  }
  expect(sum, 'All Results should equal the sum of the categories').toBe(all);
});

test('a category filter shows only that kind of result', async ({ page }) => {
  const dialog = await search(page);
  const toolbar = dialog.getByRole('toolbar', { name: 'Filter search results' });
  const grid = dialog.getByRole('grid', { name: 'Search results table' }).or(dialog.locator('[aria-label="Search results table"]')).first();
  const rows = grid.locator('.ag-center-cols-container [role=row]');

  for (const category of CATEGORIES) {
    const count = await hits(dialog, category);
    await toolbar.getByRole('button', { name: new RegExp(`^${category}, \\d+ hits$`) }).click();
    if (count === 0) {
      await expect(rows, `${category}: no rows`).toHaveCount(0);
    } else {
      // Long lists are virtualised, so only some rows are in the page.
      await expect(rows.first(), `${category}: rows shown`).toBeVisible();
      expect(await rows.count(), `${category}: no more rows than hits`).toBeLessThanOrEqual(count);
    }
  }
});

test('double-clicking an experiment result opens that experiment', async ({ page }) => {
  const dialog = await search(page);
  test.skip(await hits(dialog, 'Experiments') === 0, `no experiments match "${TERM}"`);
  await dialog.getByRole('toolbar', { name: 'Filter search results' })
    .getByRole('button', { name: /^Experiments, \d+ hits$/ }).click();

  const grid = dialog.locator('[aria-label="Search results table"]').first();
  const numberCell = grid.locator('.ag-center-cols-container [role=row]').first().locator('[col-id="number"]');
  const number = (await numberCell.innerText()).trim();
  expect(number, 'the row shows an experiment number').toMatch(/^[A-Z]*\d+R\d*$/);
  await numberCell.dblclick();
  await waitForSpinner(page);

  await expect(page).toHaveURL(/\/experiments\/detail\/\d+/);
  await expect(page.getByRole('region', { name: 'Experiment Detail Overview' }).getByRole('heading', { level: 1 }))
    .toHaveText(`Experiment ${number}`);
  await expectNoErrorDialog(page);
});
