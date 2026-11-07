import { expect, Locator, Page, test } from '@playwright/test';
import { BrowsePage, browsePages, enterApp, LIST_TIMEOUT, openBrowsePage } from './browse-pages';
import { waitForSpinner } from './helpers';
import { expectNoErrorDialog } from './tree-helpers';

// The "My experiments / My lab / ... / All" filters on the Experiments and Analysis pages. Each
// choice must send the matching parameters with the list request, and the list must load. Ordinary
// users only: admins pick labs instead and don't have these radio buttons. Read-only.

const experiments = browsePages.find(p => p.name === 'experiments')!;
const analysis = browsePages.find(p => p.name === 'analysis')!;

/** Picks a radio button, presses Search and returns the list request's parameters. */
async function searchWith(page: Page, p: BrowsePage, radio: Locator): Promise<URLSearchParams> {
  const filter = page.getByRole('search', { name: 'Browse filter' });
  await radio.check();
  const request = page.waitForRequest(r => r.url().includes(p.listEndpoint), { timeout: LIST_TIMEOUT });
  const response = page.waitForResponse(r => r.url().includes(p.listEndpoint), { timeout: LIST_TIMEOUT });
  await filter.getByRole('button', { name: 'Search', exact: true }).click();
  const url = (await request).url();
  expect((await response).ok(), `${p.listEndpoint} should succeed`).toBe(true);
  await waitForSpinner(page);
  await expectNoErrorDialog(page);
  await expect(page.getByRole('tree', { name: p.tree })).toBeVisible();
  return new URL(url).searchParams;
}

/** Opens the page and returns its radio group, or skips if this user doesn't have one. */
async function radioGroup(page: Page, p: BrowsePage, name: string): Promise<Locator> {
  await enterApp(page);
  await openBrowsePage(page, p);
  const group = page.getByRole('search', { name: 'Browse filter' }).getByRole('radiogroup', { name });
  test.skip(!(await group.isVisible()), `this user has no "${name}" radio buttons (admins browse by lab instead)`);
  return group;
}

test('the Experiments filter sends the chosen scope', async ({ page }) => {
  const group = await radioGroup(page, experiments, 'Experiments filter');
  const radio = (name: string) => group.getByRole('radio', { name, exact: true });

  let params = await searchWith(page, experiments, radio('My experiments'));
  expect(params.get('expRadio')).toBe('myExperiments');
  expect(params.get('idAppUser'), 'only the signed-in user\'s experiments').toMatch(/^\d+$/);
  expect(params.get('allExperiments')).toBeNull();

  params = await searchWith(page, experiments, radio('My collaborations'));
  expect(params.get('expRadio')).toBe('myCollaborations');
  expect(params.get('allCollaborations')).toBe('Y');

  if (await radio('Public data').isVisible()) {
    params = await searchWith(page, experiments, radio('Public data'));
    expect(params.get('expRadio')).toBe('publicData');
    expect(params.get('publicExperimentsInOtherGroups')).toMatch(/^[YN]$/);
  }

  params = await searchWith(page, experiments, radio('All'));
  expect(params.get('expRadio')).toBe('all');
  expect(params.get('allExperiments')).toBe('Y');

  // Back to the default: none of the other choices' parameters should linger.
  params = await searchWith(page, experiments, radio('My lab'));
  expect(params.get('expRadio')).toBe('myLab');
  for (const leftover of ['allExperiments', 'allCollaborations', 'publicExperimentsInOtherGroups']) {
    expect(params.get(leftover), `${leftover} after choosing My lab`).toBeNull();
  }
});

test('the Analysis filter sends the chosen scope', async ({ page }) => {
  const group = await radioGroup(page, analysis, 'Analyses filter');
  const radio = (name: string) => group.getByRole('radio', { name, exact: true });

  let params = await searchWith(page, analysis, radio('My analyses'));
  expect(params.get('anaRadio')).toBe('myAnalyses');
  expect(params.get('idAppUser'), 'only the signed-in user\'s analyses').toMatch(/^\d+$/);

  params = await searchWith(page, analysis, radio('Other labs'));
  expect(params.get('anaRadio')).toBe('otherLabs');
  expect(params.get('publicAnalysisOtherGroups')).toBe('Y');

  params = await searchWith(page, analysis, radio('All'));
  expect(params.get('anaRadio')).toBe('all');
  expect(params.get('allAnalysis')).toBe('Y');

  params = await searchWith(page, analysis, radio('My lab'));
  for (const leftover of ['allAnalysis', 'publicAnalysisOtherGroups', 'idAppUser']) {
    expect(params.get(leftover), `${leftover} after choosing My lab`).toBeNull();
  }
});
