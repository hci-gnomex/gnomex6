import { expect, Locator, Page } from '@playwright/test';
import { waitForSpinner } from './helpers';

// Helpers for the angular-tree-component trees (role=tree / role=treeitem, with aria-expanded on
// nodes that have children) and for GNomEx's error dialog.

/**
 * Fails the test if GNomEx showed its "ERROR" dialog, or its "INVALID" one (e.g. "Insufficient
 * permission to access this request or this lab"), quoting the server's message.
 */
export async function expectNoErrorDialog(page: Page): Promise<void> {
  const error = page.getByRole('alertdialog', { name: /^(ERROR|INVALID)$/ });
  if (await error.count() > 0) {
    throw new Error(`GNomEx showed an ERROR dialog: ${(await error.first().innerText()).replace(/\s+/g, ' ').trim()}`);
  }
}

/**
 * Selects a collapsed node and expands it with the keyboard (ArrowRight). Children are often
 * fetched after the node opens, so this also waits (briefly) for the tree to grow.
 */
export async function expandNode(page: Page, node: Locator, tree?: Locator): Promise<void> {
  const countBefore = tree ? await tree.getByRole('treeitem').count() : 0;
  await node.click();
  await waitForSpinner(page);
  await page.keyboard.press('ArrowRight');
  await expect(node).toHaveAttribute('aria-expanded', 'true');
  await waitForSpinner(page);
  if (tree) {
    // An empty folder never grows, so don't fail here; the caller just moves on.
    await expect.poll(() => tree.getByRole('treeitem').count(), { timeout: 10_000 })
      .toBeGreaterThan(countBefore).catch(() => {});
  }
}

/**
 * Clicks tree items, expanding folders on the way, until the app navigates to a URL matching
 * `route`. Returns the clicked item's label, or null if none of the first `limit` items got there.
 */
export async function openFirstMatching(page: Page, tree: Locator, route: RegExp, limit = 40): Promise<string | null> {
  // TREE_DEBUG=1 logs each step, for working out why a walk found nothing.
  const debug = (msg: string) => { if (process.env.TREE_DEBUG) console.log(`tree walk: ${msg}`); };
  for (let i = 0; i < limit; i++) {
    const items = tree.getByRole('treeitem');
    if (i >= await items.count()) {
      debug(`ran out of items at ${i}`);
      return null;
    }
    const item = items.nth(i);
    const expanded = await item.getAttribute('aria-expanded');
    debug(`${i} "${await item.getAttribute('aria-label')}" expanded=${expanded} url=${page.url()}`);
    if (expanded === 'false') {
      await expandNode(page, item, tree);
      continue;
    }
    if (expanded === 'true') {
      continue; // a folder that's already open; its children follow it in the list
    }
    const label = await item.getAttribute('aria-label');
    const urlBefore = page.url();
    await item.click();
    await waitForSpinner(page);
    // Some pages load the item's data before routing, so wait for the URL to change, then check it.
    await page.waitForURL(url => url.toString() !== urlBefore, { timeout: 10_000 }).catch(() => {});
    if (route.test(page.url())) {
      return label;
    }
    debug(`clicking "${label}" stayed on ${page.url()}`);
  }
  return null;
}

/** Clicks each tab in `tablist` and checks its panel shows content. Returns the tab names. */
export async function visitEveryTab(page: Page, container: Locator): Promise<string[]> {
  const tabs = container.getByRole('tab');
  const names = await tabs.evaluateAll(els =>
    els.map(e => (e.getAttribute('aria-label') || e.textContent || '').trim()));
  for (const name of names) {
    if (process.env.TREE_DEBUG) console.log(`tab: opening "${name}"`);
    await container.getByRole('tab', { name, exact: true }).click();
    await waitForSpinner(page).catch(() => {
      throw new Error(`The "${name}" tab was still loading ("Please wait...") after 60 s.`);
    });
    await expect(container.getByRole('tab', { name, exact: true })).toHaveAttribute('aria-selected', 'true');
    const panel = container.getByRole('tabpanel', { name, exact: true });
    await expect(panel, `the "${name}" tab panel`).toBeVisible();
    // The panel's content must render, but it may have no text (e.g. an empty description).
    await expect(panel.locator('*').first(), `the "${name}" tab panel content`).toBeAttached();
    await expectNoErrorDialog(page);
  }
  return names;
}
