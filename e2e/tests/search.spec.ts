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
  // Seen 2026-11 on the dev server: "RNA" gave 20 global hits (10 analyses, 8 data tracks, 1 topic,
  // 1 experiment) but SearchIndex.gx returned every category list (RequestList, AnalysisList...)
  // empty, so each category showed 0. The categories are searched in separate Lucene indexes;
  // whether those are stale there or the category queries are built wrongly isn't known yet.
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

test('double-clicking a result opens it', async ({ page }) => {
  const dialog = await search(page);
  test.skip(await hits(dialog, 'All Results') === 0, `nothing matches "${TERM}"`);
  // All Results is shown first; its rows can be any kind of item.
  const grid = dialog.locator('[aria-label="Search results table"]').first();
  const row = grid.locator('.ag-center-cols-container [role=row]').first();
  const number = (await row.locator('[col-id="number"]').innerText()).trim();
  const urlBefore = page.url();
  await row.locator('[col-id="name"], [col-id="number"]').first().dblclick();
  await waitForSpinner(page);

  // Experiments, analyses and data tracks open their detail page; topics open under Topics.
  await expect(page).not.toHaveURL(urlBefore);
  await expect(page).toHaveURL(/\/(experiments|analysis|datatracks)\/detail\/\d+|\/topics\/detail\/\d+/);
  // The item opens behind the search dialog, which stays open and hides the page from assistive
  // technology (aria-hidden) until it's closed.
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(dialog).toBeHidden();
  if (/^[A-Z]*\d+R\d*$/.test(number)) {
    // Experiments registered from outside the core are titled "External Experiment ...".
    await expect(page.getByRole('region', { name: 'Experiment Detail Overview' }).getByRole('heading', { level: 1 }))
      .toHaveText(new RegExp(`^\\s*(External )?Experiment ${number}\\s*$`));
  } else if (/^A\d+$/.test(number)) {
    await expect(page.getByRole('toolbar', { name: 'Analysis actions' })).toContainText(number);
  }
  await expectNoErrorDialog(page);
});
