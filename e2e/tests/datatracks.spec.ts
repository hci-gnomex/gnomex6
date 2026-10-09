import { expect, test } from '@playwright/test';
import { browsePages, enterApp, openBrowsePage } from './browse-pages';
import { waitForSpinner } from './helpers';
import { expectNoErrorDialog, openFirstMatching } from './tree-helpers';

// Read-only: searches and opens data tracks; nothing is saved.

const dataTracks = browsePages.find(p => p.name === 'data tracks')!;
// A word that appears in data track names or paths on most GNomEx installs (human genome build).
const SEARCH_TERM = process.env.GNOMEX_DATATRACK_SEARCH || 'hg19';

test.describe('data tracks', () => {
  test.beforeEach(async ({ page }) => {
    await enterApp(page);
    await openBrowsePage(page, dataTracks);
  });

  test('selecting an organism opens its page', async ({ page }) => {
    const tree = page.getByRole('tree', { name: dataTracks.tree });
    const organism = tree.getByRole('treeitem').first();
    await organism.click();
    await waitForSpinner(page);
    // Admins' URLs also carry the lab and visibility filter before idOrganism.
    await expect(page).toHaveURL(/\/datatracks\/organism\?(.*&)?idOrganism=\d+/);
    await expect(organism).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('region', { name: dataTracks.detailsPanel })).not.toBeEmpty();
    await expectNoErrorDialog(page);
  });

  test('the search box narrows the tree to matching tracks', async ({ page }) => {
    const navigation = page.getByRole('navigation', { name: 'Data track navigation' });
    const tree = page.getByRole('tree', { name: dataTracks.tree });
    const organismsBefore = await tree.getByRole('treeitem').count();

    await navigation.getByRole('textbox', { name: 'Search data tracks' }).fill(SEARCH_TERM);
    await navigation.getByRole('button', { name: 'Search', exact: true }).click();
    await waitForSpinner(page);

    // Results come back as the matching branches, opened out: organism > genome build > folders.
    const items = tree.getByRole('treeitem');
    await expect.poll(() => items.count(), { message: 'the tree should change after searching' }).not.toBe(organismsBefore);
    test.skip(await items.count() === 0, `no data tracks match "${SEARCH_TERM}"; set GNOMEX_DATATRACK_SEARCH`);
    await expect(items.first()).toHaveAttribute('aria-expanded', 'true');
  });

  test('a data track opens with its summary', async ({ page }) => {
    // Walks organism > genome build > folders until it reaches a track. (Search results show the
    // matching folders but not the tracks inside them, so they can't be used to get to a track.)
    const opened = await openFirstMatching(page, page.getByRole('tree', { name: dataTracks.tree }), /\/datatracks\/detail\/\d+/, 150);
    test.skip(!opened, "no data track found in the first part of the tree");

    const details = page.getByRole('region', { name: dataTracks.detailsPanel });
    await expect(details.getByRole('toolbar', { name: 'Data track actions' })).toContainText(/Data Track DT\d+/);
    await expect(details.getByRole('tab').first()).toBeVisible();
    await expectNoErrorDialog(page);
  });
});
