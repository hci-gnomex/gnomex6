import { expect, test } from '@playwright/test';
import { browsePages, enterApp, openBrowsePage } from './browse-pages';
import { waitForSpinner } from './helpers';
import { expectNoErrorDialog, openFirstMatching } from './tree-helpers';

// The header's lookup and search boxes and the Help menu. Read-only.

test.describe('header', () => {
  test.beforeEach(async ({ page }) => {
    await enterApp(page);
  });

  test('looking up an experiment number opens that experiment', async ({ page }) => {
    // Take a real number from the tree, so this works on any server.
    const experiments = browsePages.find(p => p.name === 'experiments')!;
    await openBrowsePage(page, experiments);
    const opened = await openFirstMatching(page, page.getByRole('tree', { name: experiments.tree }), /\/experiments\/detail\/\d+/);
    test.skip(!opened, "the user can't see any experiments");
    const heading = page.getByRole('main', { name: 'Experiment Detail Overview' }).getByRole('heading', { level: 1 });
    const number = (await heading.innerText()).replace('Experiment ', '').trim();
    const detailUrl = page.url().split('?')[0];

    await page.getByRole('link', { name: 'GNomEx home' }).click();
    await expect(page).toHaveURL(/\/home/);

    const search = page.getByRole('search', { name: 'Header search' });
    await search.getByRole('textbox', { name: 'Lookup by experiment number' }).fill(number);
    await search.getByRole('button', { name: 'Search by number' }).click();
    await waitForSpinner(page);

    await expect(page).toHaveURL(new RegExp(detailUrl.replace(/[.?]/g, '\\$&')));
    await expect(heading).toHaveText(`Experiment ${number}`);
  });

  test('text search returns results', async ({ page }) => {
    // Currently fails on servers without a Lucene index (the server reports
    // "directory '.../luceneIndex/global' does not exist"); build the index with scripts/index_gnomex.*.
    const search = page.getByRole('search', { name: 'Header search' });
    await search.getByRole('textbox', { name: 'Search by text' }).fill('RNA');
    const response = page.waitForResponse(r => r.url().includes('SearchIndex.gx'));
    await search.getByRole('button', { name: 'Submit text search' }).click();
    await response;
    await waitForSpinner(page);

    // Wait for whichever comes first, the results or GNomEx's ERROR dialog, then report the error.
    const dialog = page.getByRole('dialog', { name: 'Advanced Search' }).last();
    const resultsTab = dialog.getByRole('tab', { name: 'Search Results', exact: true, selected: true });
    await expect(resultsTab.or(page.getByRole('alertdialog', { name: 'ERROR' })).first()).toBeVisible();
    await expectNoErrorDialog(page);
    await expect(dialog.getByRole('tabpanel', { name: 'Search Results', exact: true })).not.toBeEmpty();
  });

  test('the Help menu lists its items', async ({ page }) => {
    await page.getByRole('button', { name: 'Help menu' }).click();
    const menu = page.getByRole('menu');
    await expect(menu.getByRole('menuitem')).toHaveText(['User Guide', 'About', 'Contact Us']);
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
  });

  test('About shows the version and closes', async ({ page }) => {
    await page.getByRole('button', { name: 'Help menu' }).click();
    await page.getByRole('menuitem', { name: 'About' }).click();
    const about = page.getByRole('dialog', { name: 'About', exact: true });
    await expect(about.getByRole('heading', { name: 'About' })).toBeVisible();
    await expect(about).toContainText(/Version \d+\.\d+/);
    await about.getByRole('button', { name: 'Close dialog' }).click();
    await expect(about).toBeHidden();
  });
});
