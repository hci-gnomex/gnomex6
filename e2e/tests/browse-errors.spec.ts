import { expect, Locator, Page, test } from '@playwright/test';
import { browsePages, enterApp, openBrowsePage } from './browse-pages';
import { waitForSpinner } from './helpers';
import { expandNode } from './tree-helpers';

// When the server refuses to open something picked in a browse tree (GNomEx answers HTTP 200 with
// {"result":"INVALID"}), the user is told why, and the page stays usable once they press Ok.
// The refusal is faked in the browser for one call so this runs on any server and any account.
//
// Seen 2026-11: an analysis group the server refused ("Insufficient permissions to access this
// analysis Group.") showed the message, but "Please wait..." stayed up for good behind it and
// blocked the page until a reload. Fixed: the browse pages stop the spinner when the navigation
// fails (browse-analysis/browse-experiments.component.ts).

const REFUSAL = 'Insufficient permission (faked by the e2e test).';

/** Answers the next call to `endpoint` with GNomEx's INVALID reply; later calls go to the server. */
async function refuseOnce(page: Page, endpoint: RegExp): Promise<void> {
  await page.route(endpoint, route => route.fulfill({
    status: 200, contentType: 'application/json', body: JSON.stringify({ result: 'INVALID', message: REFUSAL }),
  }), { times: 1 });
}

/** Expands folders until the tree shows a leaf (an experiment or analysis) after `from`; returns its index. */
async function firstLeaf(page: Page, tree: Locator, from = 0): Promise<number> {
  const items = tree.getByRole('treeitem');
  for (let i = from; i < from + 40 && i < await items.count(); i++) {
    const expanded = await items.nth(i).getAttribute('aria-expanded');
    if (expanded === 'false') {
      await expandNode(page, items.nth(i), tree);
    }
    if (expanded === null) {
      return i;
    }
  }
  return -1;
}

/** Checks the refusal is shown, closes it, and checks the "Please wait..." spinner has gone. */
async function expectRefusalThenUsable(page: Page): Promise<void> {
  const alert = page.getByRole('alertdialog', { name: 'INVALID' });
  await expect(alert).toBeVisible();
  await expect(alert).toContainText(REFUSAL);
  await alert.getByRole('button', { name: 'Ok' }).click();
  await expect(alert).toBeHidden();
  await expect(page.locator('spinner-dialog'), '"Please wait..." should not stay up').toHaveCount(0, { timeout: 15_000 });
}

/** Clicks a tree item and waits for the page it opens. */
async function openItem(page: Page, item: Locator, route: RegExp): Promise<void> {
  await item.click();
  await waitForSpinner(page);
  await expect(page).toHaveURL(route);
}

for (const pageName of ['experiments', 'analysis'] as const) {
  const p = browsePages.find(b => b.name === pageName)!;
  const detail = pageName === 'experiments' ? /\/experiments\/detail\/\d+/ : /\/analysis\/detail\/\d+/;
  const itemCall = pageName === 'experiments' ? /\/GetRequest\.gx/ : /\/GetAnalysis\.gx/;

  test(`${pageName}: a refused item explains why and leaves the page usable`, async ({ page }) => {
    await enterApp(page);
    await openBrowsePage(page, p);
    const tree = page.getByRole('tree', { name: p.tree });
    const leaf = await firstLeaf(page, tree);
    test.skip(leaf < 0, `the user can't see any ${pageName}`);
    const item = tree.getByRole('treeitem').nth(leaf);

    await refuseOnce(page, itemCall);
    await item.click();
    await expectRefusalThenUsable(page);
    await expect(page, 'the refused item is not opened').not.toHaveURL(detail);

    // The page still works: another item opens. (Clicking the refused item again does nothing,
    // since the tree already has it selected.)
    const next = await firstLeaf(page, tree, leaf + 1);
    test.skip(next < 0, `the user can see only one of the ${pageName}`);
    await openItem(page, tree.getByRole('treeitem').nth(next), detail);
  });
}

test('analysis: a refused analysis group explains why and leaves the page usable', async ({ page }) => {
  const p = browsePages.find(b => b.name === 'analysis')!;
  await enterApp(page);
  await openBrowsePage(page, p);
  const tree = page.getByRole('tree', { name: p.tree });
  const leaf = await firstLeaf(page, tree);
  test.skip(leaf < 1, "the user can't see any analysis groups");
  // Labs hold analysis groups, which hold analyses, so the first analysis follows its group.
  const items = tree.getByRole('treeitem');
  const group = items.nth(leaf - 1);

  await refuseOnce(page, /\/GetAnalysisGroup\.gx/);
  await group.click();
  await expectRefusalThenUsable(page);
  await expect(page).not.toHaveURL(/\/analysis\/overview/);

  await openItem(page, items.nth(leaf), /\/analysis\/detail\/\d+/);
});
