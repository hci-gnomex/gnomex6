import { expect, Page, test } from '@playwright/test';
import { guestLogin, hasCredentials, openFromNav, waitForAppReady, waitForSpinner } from './helpers';

// With an account, these run with the signed-in state saved by auth.setup.ts.
// Without one, each test enters as a guest, which covers the public data only.

interface BrowsePage {
  name: string;
  navItem: string;
  /** Set when the header item is a drop-down for signed-in users. */
  menuItem?: string;
  route: RegExp;
  region: string;
  tree: string;
  detailsPanel: string;
  listEndpoint: string;
  /** URL a node click can lead to (overview of a group or detail of an item). */
  nodeRoute: RegExp;
}

const pages: BrowsePage[] = [
  {
    name: 'experiments',
    navItem: 'Experiments',
    menuItem: 'Browse Experiments',
    route: /\/experiments/,
    region: 'Experiments Browser',
    tree: 'Experiments hierarchy',
    detailsPanel: 'Experiment details panel',
    listEndpoint: 'GetProjectRequestList.gx',
    nodeRoute: /\/experiments\/(overview|detail)/,
  },
  {
    name: 'analysis',
    navItem: 'Analysis',
    route: /\/analysis/,
    region: 'Browse analysis',
    tree: 'Analysis groups and analyses',
    detailsPanel: 'Analysis details panel',
    listEndpoint: 'GetAnalysisGroupList.gx',
    nodeRoute: /\/analysis\/(overview|detail)/,
  },
  {
    name: 'data tracks',
    navItem: 'Data Tracks',
    route: /\/datatracks/,
    region: 'Data Tracks Browser',
    tree: 'Data track folders and tracks',
    detailsPanel: 'Data track details panel',
    listEndpoint: 'GetDataTrackList.gx',
    nodeRoute: /\/datatracks\/(organism|genomebuild|folder|detail)/,
  },
];

async function openBrowsePage(page: Page, p: BrowsePage): Promise<void> {
  if (hasCredentials) {
    await page.goto('home');
    await waitForAppReady(page);
  } else {
    await guestLogin(page);
  }

  const treeLoaded = page.waitForResponse(r => r.url().includes(p.listEndpoint) && r.ok());
  await openFromNav(page, p.navItem, p.menuItem);
  await page.waitForURL(p.route);
  await treeLoaded;
  await expect(page.getByRole('main', { name: p.region })).toBeVisible();
}

for (const p of pages) {
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
