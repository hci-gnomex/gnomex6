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
    const heading = page.getByRole('region', { name: 'Experiment Detail Overview' }).getByRole('heading', { level: 1 });
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

test('Help › User Guide opens in a new tab and leaves the page as it was', async ({ page, context }) => {
  // Don't load the guide itself; answer outside sites with a stub page.
  const appOrigin = new URL(test.info().project.use.baseURL!).origin;
  await context.route(url => url.origin !== appOrigin, route => route.fulfill({ contentType: 'text/html', body: '<title>stub</title>' }));
  await enterApp(page);
  const before = page.url();
  const tab = context.waitForEvent('page');
  await page.getByRole('button', { name: 'Help menu' }).click();
  await page.getByRole('menuitem', { name: 'User Guide' }).click();
  const guide = await tab;
  await expect.poll(() => guide.url(), 'the guide opens').not.toMatch(/^(about:blank)?$/);
  await guide.close();
  // Same route mechanism as the Links menu (ExternalRoute), so the same check.
  expect(page.url(), 'this tab stays where it was').toBe(before);
  await expect(page.locator('#main-content')).not.toBeEmpty();
});

test('each Links menu item opens its link in a new tab and leaves the page as it was', async ({ page, context }) => {
  // The items are GNomEx's configured quick links (GetFAQ.gx), read at sign-in.
  const faq = page.waitForResponse(r => /GetFAQ\.gx/i.test(r.url()), { timeout: 150_000 }).then(r => r.json(), () => null);
  // Don't load the outside sites; answer them with a stub page instead.
  const appOrigin = new URL(test.info().project.use.baseURL!).origin;
  await context.route(url => url.origin !== appOrigin, route => route.fulfill({ contentType: 'text/html', body: '<title>stub</title>' }));
  await enterApp(page);
  const links: { title: string; url: string }[] = [].concat((await faq) || []);
  test.skip(links.length === 0, 'no quick links are configured');

  for (const link of links) {
    await test.step(link.title, async () => {
      const before = page.url();
      const tab = context.waitForEvent('page');
      await page.getByRole('button', { name: 'Links menu' }).click();
      await page.getByRole('menuitem', { name: link.title, exact: true }).click();
      const opened = await tab;
      await expect.poll(() => opened.url(), `${link.title} opens its link`).toBe(new URL(link.url).toString());
      await opened.close();
      // Seen 2026-11: the item also routed this tab to an empty page ("/gnomex/<first word>",
      // titled just "GNomEx"), so the user lost the page they were on. Fixed: ExternalRoute opens
      // the link from a guard that cancels the navigation (external-routes.module.ts).
      expect.soft(page.url(), 'this tab stays where it was').toBe(before);
      await expect.soft(page.locator('#main-content'), 'and keeps its content').not.toBeEmpty();
      if (page.url() !== before) {
        await page.goto(before);
        await expect(page.locator('#main-nav')).toBeVisible({ timeout: 60_000 });
      }
    });
  }
  await expectNoErrorDialog(page);
});
