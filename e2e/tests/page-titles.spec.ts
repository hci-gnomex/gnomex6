import { expect, Page, test } from '@playwright/test';
import { browsePages, enterApp, openBrowsePage } from './browse-pages';
import { openLoginPage, waitForSpinner } from './helpers';
import { openFirstMatching } from './tree-helpers';

// Each page sets the browser tab's title (WCAG 2.4.2 Page Titled), e.g. "Experiments — GNomEx", so
// screen-reader users and people with many tabs open can tell where they are. Read-only.

const experiments = browsePages.find(p => p.name === 'experiments')!;
const analysis = browsePages.find(p => p.name === 'analysis')!;

/** Soft-checks the title so one run lists every page whose title is wrong. */
async function expectTitle(page: Page, title: string): Promise<void> {
  const path = new URL(page.url()).pathname + new URL(page.url()).search;
  await expect.soft(page, `title on ${path}`).toHaveTitle(title);
}

test('the sign-in page is titled', async ({ page }) => {
  await openLoginPage(page);
  await expectTitle(page, 'Sign In — GNomEx');
});

test('each main page is titled', async ({ page }) => {
  await enterApp(page);
  await expectTitle(page, 'Home — GNomEx');

  // Seen 2026-11: the Experiments list (/experiments?expRadio=myLab) and any other page whose URL
  // has a query string right after its name were titled just "GNomEx".
  await openBrowsePage(page, experiments);
  await expectTitle(page, 'Experiments — GNomEx');
  const opened = await openFirstMatching(page, page.getByRole('tree', { name: experiments.tree }), /\/experiments\/detail\/\d+/);
  if (opened) {
    await expectTitle(page, 'Experiments — GNomEx');
    await page.goBack();
    await waitForSpinner(page);
    await expect(page).toHaveURL(/\/experiments(\?|$)/);
    await expectTitle(page, 'Experiments — GNomEx');
  }

  await openBrowsePage(page, analysis);
  await expectTitle(page, 'Analysis — GNomEx');

  const topics = page.locator('#main-nav').getByRole('button', { name: 'Topics', exact: true });
  if (await topics.isVisible()) {
    await topics.click();
    await waitForSpinner(page);
    await expect(page).toHaveURL(/\/topics/);
    await expectTitle(page, 'Topics — GNomEx');
  }

  await page.getByRole('link', { name: 'GNomEx home' }).click();
  await expect(page).toHaveURL(/\/home/);
  await expectTitle(page, 'Home — GNomEx');
});
