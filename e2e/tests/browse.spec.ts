import { expect, Page, test } from '@playwright/test';
import { waitForSpinner } from './helpers';
import { BrowsePage, browsePages, enterApp, openBrowsePage as openFromHeader } from './browse-pages';

// With an account, these run with the signed-in state saved by auth.setup.ts.
// Without one, each test enters as a guest, which covers the public data only.
// auth.setup.ts warms the server up first, so a cold first query doesn't time these out.

async function openBrowsePage(page: Page, p: BrowsePage): Promise<void> {
  await enterApp(page);
  await openFromHeader(page, p);
}

for (const p of browsePages) {
  test.describe(`browse ${p.name}`, () => {
    test('opens from the header and loads the tree', async ({ page }) => {
      await openBrowsePage(page, p);

      await expect(page.getByRole('search', { name: 'Browse filter' })).toBeVisible();
      await expect(page.getByRole('tree', { name: p.tree })).toBeVisible();
    });

    test('re-runs the search from the filter bar', async ({ page }) => {
      await openBrowsePage(page, p);

      const reloaded = page.waitForResponse(r => r.url().includes(p.listEndpoint) && r.ok());
      await page.getByRole('search', { name: 'Browse filter' }).getByRole('button', { name: 'Search', exact: true }).click();
      await reloaded;
      await waitForSpinner(page);
      await expect(page.getByRole('tree', { name: p.tree })).toBeVisible();
    });

    test('selecting the first tree node shows its details', async ({ page }) => {
      await openBrowsePage(page, p);

      const firstNode = page.getByRole('tree', { name: p.tree }).getByRole('treeitem').first();
      test.skip(await firstNode.count() === 0, `the test user can't see any ${p.name}`);

      await firstNode.click();
      await waitForSpinner(page);
      await page.waitForURL(p.nodeRoute);
      await expect(firstNode).toHaveAttribute('aria-selected', 'true');
      const details = page.getByRole('region', { name: p.detailsPanel });
      await expect(details).toBeVisible();
      await expect(details).not.toBeEmpty();
    });
  });
}
