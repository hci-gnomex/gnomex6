import { expect, Locator, Page, test } from '@playwright/test';
import { browsePages, enterApp, openBrowsePage } from './browse-pages';
import { waitForAppReady, waitForSpinner } from './helpers';
import { expectNoErrorDialog, openFirstMatching } from './tree-helpers';

// "Share URL" gives a link like /gnomex/?requestNumber=S1261R. These check the link, then follow it
// in the same (signed-in) browser and expect to land on the same item. Read-only.

const experiments = browsePages.find(p => p.name === 'experiments')!;
const analysis = browsePages.find(p => p.name === 'analysis')!;
const dataTracks = browsePages.find(p => p.name === 'data tracks')!;

/** Opens the share dialog with `button`, returns the link it shows and closes the dialog. */
async function shareLink(page: Page, button: Locator, dialogTitle: string | RegExp): Promise<string> {
  await button.click();
  const dialog = page.getByRole('dialog', { name: dialogTitle }).first();
  const link = await dialog.getByRole('textbox', { name: 'Shareable link URL' }).inputValue();
  await dialog.getByRole('button', { name: 'Close dialog' }).click();
  await expect(dialog).toBeHidden();
  return link;
}

/** The link a share dialog should show: this server's /gnomex/ with one number parameter. */
function expectedLink(page: Page, param: string, value: string): string {
  return `${new URL(page.url()).origin}/gnomex/?${param}=${value}`;
}

/** True when the page is at `path` (under /gnomex) and its query has every given parameter. */
function at(path: string, params: Record<string, string> = {}): (url: URL) => boolean {
  return url => url.pathname === `/gnomex${path}` &&
    Object.entries(params).every(([k, v]) => url.searchParams.get(k) === v);
}

/** Follows a share link the way a colleague would: a fresh page load with the link as its URL. */
async function follow(page: Page, link: string): Promise<void> {
  await page.goto(link);
  await waitForAppReady(page).catch(() => {}); // a working link leaves /home again straight away
  await waitForSpinner(page);
}

test.beforeEach(async ({ page }) => {
  await enterApp(page);
});

test('an experiment link opens that experiment', async ({ page }) => {
  await openBrowsePage(page, experiments);
  const opened = await openFirstMatching(page, page.getByRole('tree', { name: experiments.tree }), /\/experiments\/detail\/\d+/);
  test.skip(!opened, "the user can't see any experiments");
  const id = page.url().match(/\/experiments\/detail\/(\d+)/)![1];
  const detail = page.getByRole('main', { name: 'Experiment Detail Overview' });
  const number = (await detail.getByRole('heading', { level: 1 }).innerText()).replace('Experiment', '').trim();

  const link = await shareLink(page, detail.getByRole('button', { name: 'Share experiment URL' }), `Web Link for Experiment ${number}`);
  expect(link).toBe(expectedLink(page, 'requestNumber', number));

  await follow(page, link);
  await expect(page).toHaveURL(at(`/experiments/detail/${id}`));
  await expect(detail.getByRole('heading', { level: 1 })).toHaveText(`Experiment ${number}`);
  // Tree labels look like "S1261R-name-S1261R".
  await expect(page.getByRole('tree', { name: experiments.tree }).getByRole('treeitem', { selected: true }),
    'the experiment should be selected in the tree').toHaveAttribute('aria-label', new RegExp('^' + number));
  await expectNoErrorDialog(page);
});

test('an analysis link opens that analysis', async ({ page }) => {
  await openBrowsePage(page, analysis);
  const opened = await openFirstMatching(page, page.getByRole('tree', { name: analysis.tree }), /\/analysis\/detail\/\d+/);
  test.skip(!opened, "the user can't see any analyses");
  const id = page.url().match(/\/analysis\/detail\/(\d+)/)![1];
  const number = opened!.match(/^A\d+/)![0];
  const actions = page.getByRole('main', { name: 'Analysis detail overview' }).getByRole('toolbar', { name: 'Analysis actions' });

  const link = await shareLink(page, actions.getByRole('button', { name: 'Share URL' }), /^(Web Link for Analysis|Share link)/);
  expect(link).toBe(expectedLink(page, 'analysisNumber', number));

  await follow(page, link);
  await expect(page).toHaveURL(at(`/analysis/detail/${id}`));
  // Seen 2026-11 (fixed in browse-filter.component.ts): for a user in a single lab the link never
  // loaded the analysis list, so the tree stayed empty, nothing was selected, and the toolbar (which
  // takes its number from the selected node) read just "Analysis".
  await expect.soft(page.getByRole('tree', { name: analysis.tree }).getByRole('treeitem', { selected: true }),
    'the analysis should be selected in the tree').toHaveAttribute('aria-label', new RegExp('^' + number));
  await expect(actions, 'the toolbar should show the analysis number').toContainText(`Analysis ${number}`);
  await expectNoErrorDialog(page);
});

test('a data track link opens that data track', async ({ page }) => {
  // The data track list takes ~1 min for a signed-in ordinary user, and this loads it twice.
  test.slow();
  await openBrowsePage(page, dataTracks);
  const opened = await openFirstMatching(page, page.getByRole('tree', { name: dataTracks.tree }), /\/datatracks\/detail\/\d+/, 150);
  test.skip(!opened, 'no data track found in the first part of the tree');
  const id = page.url().match(/\/datatracks\/detail\/(\d+)/)![1];
  const actions = page.getByRole('region', { name: dataTracks.detailsPanel }).getByRole('toolbar', { name: 'Data track actions' });
  const number = (await actions.innerText()).match(/Data Track (DT\d+)/)![1];

  const link = await shareLink(page, actions.getByRole('button', { name: /Share URL/ }), /^(Web Link for Data Track|Share link)/);
  expect(link).toBe(expectedLink(page, 'dataTrackNumber', number));

  // Single-lab users had the same empty-tree problem as analysis links (see above).
  await follow(page, link);
  await expect(page).toHaveURL(at(`/datatracks/detail/${id}`));
  await expect(page.getByRole('tree', { name: dataTracks.tree }).getByRole('treeitem', { selected: true }),
    'the data track should be selected in the tree').toHaveCount(1, { timeout: 150_000 });
  await expect(actions, 'the toolbar should show the data track number').toContainText(`Data Track ${number}`);
  await expectNoErrorDialog(page);
});

test('a topic link opens that topic', async ({ page }) => {
  const topicsButton = page.locator('#main-nav').getByRole('button', { name: 'Topics', exact: true });
  test.skip(!(await topicsButton.isVisible()), '"Topics" isn\'t in this user\'s main menu');
  await topicsButton.click();
  await waitForSpinner(page);
  const tree = page.getByRole('tree', { name: 'Topics' });
  await expect(tree.getByRole('treeitem').first()).toBeVisible();
  test.skip(await tree.getByRole('treeitem').count() < 2, 'there are no topics');
  await tree.getByRole('treeitem').nth(1).click(); // the first item is the "Topics" root
  await waitForSpinner(page);
  await expect(page).toHaveURL(url => /^\/gnomex\/topics\/detail\/\d+$/.test(url.pathname) && url.searchParams.has('idTopic'));
  const topicPath = new URL(page.url()).pathname.replace(/^\/gnomex/, '');
  const idTopic = new URL(page.url()).searchParams.get('idTopic')!;
  const details = page.getByRole('region', { name: 'Topic details' });
  const title = (await details.getByText(/^\s*Topic T\d+ - /).first().innerText()).trim();

  const link = await shareLink(page, details.getByRole('button', { name: 'Share URL' }), /Web Link for|Share link/);
  // Topics have no number of their own; the link carries the topic's id.
  expect(link).toBe(expectedLink(page, 'topicNumber', idTopic));

  // Seen 2026-11, 2 tries in 5: the link stopped at /home?topicNumber=N without opening the topic.
  await follow(page, link);
  await expect(page, 'the topic link should leave Home and open the topic').toHaveURL(at(topicPath, { idTopic }));
  await expect(details).toContainText(title);
  await expectNoErrorDialog(page);
});

test('a link to an unknown experiment says so and stays on Home', async ({ page }) => {
  await page.goto('?requestNumber=99999999R');
  const error = page.getByRole('alertdialog', { name: 'ERROR' });
  // The server says "Request number 99999999R does not exists".
  await expect(error).toContainText(/Request number 99999999R does not exist/);
  await page.getByRole('dialog', { name: 'ERROR' }).getByRole('button', { name: 'Ok' }).click();
  await expect(error).toBeHidden();
  await expect(page).toHaveURL(/\/home/);
});
