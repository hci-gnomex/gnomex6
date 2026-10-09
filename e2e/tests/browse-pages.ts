import { expect, Locator, Page } from '@playwright/test';
import { guestLogin, hasCredentials, login, openFromNav, waitForSpinner } from './helpers';

// The three browse pages, shared by browse.spec.ts and the warm-up in auth.setup.ts.

export interface BrowsePage {
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

export const browsePages: BrowsePage[] = [
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

/**
 * Gets into the app: signs in through the form when there's an account, otherwise Guest Login.
 * Each test signs in afresh because GNomEx's sign-in token expires after 15 minutes, so one saved
 * session can't last a whole run.
 */
export async function enterApp(page: Page): Promise<void> {
  if (hasCredentials) {
    await login(page);
  } else {
    await guestLogin(page);
  }
}

/** The lab admin accounts browse and the write tests create data in (see .env.example). */
export const LAB = process.env.GNOMEX_LAB || '';

/**
 * Opens a browse page from the header and waits for its tree data to arrive. Guests and ordinary
 * users get their list straight away; admins see an empty page until they pick a lab and press
 * Search, so for them this picks GNOMEX_LAB.
 */
export async function openBrowsePage(page: Page, p: BrowsePage, listTimeout?: number): Promise<void> {
  const treeLoaded = page.waitForResponse(r => r.url().includes(p.listEndpoint) && r.ok(), { timeout: listTimeout });
  await openFromNav(page, p.navItem, p.menuItem);
  await page.waitForURL(p.route);
  const main = page.getByRole('main', { name: p.region });
  const filter = main.getByRole('search', { name: 'Browse filter' });
  // Only the admin view has a lab picker or an "All" checkbox; everyone else just waits for the list.
  const adminView = filter.getByRole('combobox', { name: 'Select a lab...' })
    .or(filter.getByRole('checkbox', { name: 'All', exact: true })).first();
  const loaded = treeLoaded.then(() => 'loaded' as const, () => 'timed out' as const);
  const first = await Promise.race([
    loaded,
    adminView.waitFor({ timeout: listTimeout }).then(() => 'admin view' as const, () => 'timed out' as const),
  ]);
  if (first === 'admin view') {
    // Give an auto-loading list a moment before deciding this view needs a lab picked.
    const stillEmpty = await Promise.race([loaded.then(() => false), page.waitForTimeout(5_000).then(() => true)]);
    if (stillEmpty) {
      const afterSearch = page.waitForResponse(r => r.url().includes(p.listEndpoint) && r.ok(), { timeout: listTimeout });
      try {
        await searchByLab(page, filter);
      } catch (e) {
        afterSearch.catch(() => {}); // don't leave the wait to fail on its own later
        throw e;
      }
      await afterSearch;
    }
  } else if (first === 'timed out' || (await loaded) === 'timed out') {
    throw new Error(`The ${p.name} list (${p.listEndpoint}) didn't load.`);
  }
  await expect(main).toBeVisible();
}

/** Picks a lab (default GNOMEX_LAB) in the browse filter's lab picker and presses Search (the admin view). */
export async function searchByLab(page: Page, filter: Locator, lab: string = LAB): Promise<void> {
  if (!lab) {
    throw new Error('This account browses by lab (an admin). Set GNOMEX_LAB in e2e/.env to the lab to use.');
  }
  // Experiments and Data Tracks have a single "Select a lab..." picker; Analysis has a multi-select
  // "Group(s)" list under More... whose type-to-filter box is (only) labelled "filter".
  const single = filter.getByRole('combobox', { name: 'Select a lab...' });
  if (await single.count()) {
    await single.click();
    await single.fill(lab);
    await page.getByRole('option', { name: lab, exact: true }).first().click();
  } else {
    const more = filter.getByRole('button', { name: 'Show more filter options' });
    if (await more.isVisible()) {
      await more.click();
    }
    const groups = filter.getByRole('combobox', { name: 'filter' });
    // The options render in Material's overlay, outside the filter. Text typed before the lab list
    // has loaded never gets filtered, so retype until the lab shows up.
    const option = page.getByRole('option', { name: lab, exact: true }).first();
    for (let attempt = 0; attempt < 6 && !(await option.isVisible()); attempt++) {
      // Once open, the list's backdrop covers the box, so only click to open it.
      if (await groups.getAttribute('aria-expanded') !== 'true') {
        await groups.click();
      }
      await groups.fill('');
      await groups.fill(lab);
      await option.waitFor({ timeout: 5_000 }).catch(() => {});
    }
    await option.click();
    // It's a multi-select, so the overlay stays open until Escape.
    await page.keyboard.press('Escape');
  }
  await filter.getByRole('button', { name: 'Search', exact: true }).click();
  await waitForSpinner(page);
}
