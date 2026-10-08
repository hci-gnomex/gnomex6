import { expect, Page } from '@playwright/test';
import { guestLogin, hasCredentials, openFromNav, waitForAppReady } from './helpers';

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

/** Gets into the app: reuses the saved sign-in when there's an account, otherwise Guest Login. */
export async function enterApp(page: Page): Promise<void> {
  if (hasCredentials) {
    await page.goto('home');
    await waitForAppReady(page);
  } else {
    await guestLogin(page);
  }
}

/** Opens a browse page from the header and waits for its tree data to arrive. */
export async function openBrowsePage(page: Page, p: BrowsePage, listTimeout?: number): Promise<void> {
  const treeLoaded = page.waitForResponse(r => r.url().includes(p.listEndpoint) && r.ok(), { timeout: listTimeout });
  await openFromNav(page, p.navItem, p.menuItem);
  await page.waitForURL(p.route);
  await treeLoaded;
  await expect(page.getByRole('main', { name: p.region })).toBeVisible();
}
