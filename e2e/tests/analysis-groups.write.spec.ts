import { expect, Page, test } from '@playwright/test';
import { searchByLab } from './browse-pages';
import { login, waitForSpinner } from './helpers';
import { expectNoErrorDialog } from './tree-helpers';
import { Cleanup, WRITE_LAB, idFromResponse, requireWritableServer, uniqueName } from './write-helpers';

// Creates and deletes analysis groups in GNOMEX_WRITE_LAB. Changes data: local throwaway DB only.

const cleanup = new Cleanup();

test.beforeEach(async ({ page }) => {
  requireWritableServer();
  await login(page);
});

test.afterEach(async ({ page }) => {
  await cleanup.run(page);
});

const analysisMain = (page: Page) => page.getByRole('main', { name: 'Browse analysis' });
const analysisTree = (page: Page) => analysisMain(page).getByRole('tree', { name: 'Analysis groups and analyses' });
const groupNode = (page: Page, name: string) => analysisTree(page).getByRole('treeitem', { name, exact: true });

/** Opens Analysis filtered to the write lab (admins get an empty page until a lab is searched). */
async function browseWriteLab(page: Page): Promise<void> {
  await page.locator('#main-nav').getByRole('button', { name: 'Analysis', exact: true }).click();
  const filter = analysisMain(page).getByRole('search', { name: 'Browse filter' });
  // Wait for the filter's lab list to load before typing into it.
  await expect(filter.getByRole('combobox', { name: 'filter' }).or(filter.getByRole('button', { name: 'Show more filter options' })).first()).toBeVisible();
  await page.waitForResponse(r => r.url().includes('GetLabList.gx'), { timeout: 5_000 }).catch(() => {});
  const listed = page.waitForResponse(r => r.url().includes('GetAnalysisGroupList.gx'));
  await searchByLab(page, filter, WRITE_LAB);
  await listed;
  await waitForSpinner(page);
  await expect(analysisTree(page).getByRole('treeitem', { name: WRITE_LAB, exact: true })).toBeVisible();
}

/** Creates an analysis group with the toolbar button; returns its id. */
async function createGroup(page: Page, name: string): Promise<string> {
  await browseWriteLab(page);
  // Selecting the lab makes it the group's lab.
  await analysisTree(page).getByRole('treeitem', { name: WRITE_LAB, exact: true }).click();
  await waitForSpinner(page);
  await analysisMain(page).getByRole('button', { name: 'Create new analysis group' }).click();

  const dialog = page.getByRole('dialog', { name: 'Create Analysis Group' }).last();
  await expect(dialog.getByRole('combobox', { name: 'Select a lab...' })).toHaveValue(WRITE_LAB);
  await dialog.getByRole('textbox', { name: 'Analysis group name' }).fill(name);

  // The Save/Cancel actions belong to the outer dialog container.
  const container = page.getByRole('dialog').filter({ has: dialog }).first();
  const saved = page.waitForResponse(r => r.url().includes('SaveAnalysisGroup.gx'));
  await container.getByRole('button', { name: 'Save', exact: true }).click();
  const response = await saved;
  expect(response.ok(), 'SaveAnalysisGroup.gx should succeed').toBe(true);
  const id = await idFromResponse(await response.text(), 'idAnalysisGroup');
  cleanup.add(`DeleteAnalysisGroup.gx?idAnalysisGroup=${id}`);

  await expect(dialog).toBeHidden();
  await waitForSpinner(page);
  await expectNoErrorDialog(page);
  return id;
}

test('a new analysis group appears under its lab and opens', async ({ page }) => {
  const name = uniqueName('group');
  const id = await createGroup(page, name);

  await expect(groupNode(page, name)).toHaveCount(1);
  await groupNode(page, name).click();
  await waitForSpinner(page);
  await expect(page).toHaveURL(new RegExp(`/analysis/overview\\?.*idAnalysisGroup=${id}`));
  await expectNoErrorDialog(page);
});

test('an analysis group can be deleted', async ({ page }) => {
  const name = uniqueName('group');
  const id = await createGroup(page, name);

  // A new group is selected automatically, and clicking a selected node deselects it. Seen 2026-10:
  // with nothing selected, Delete still asks "Yes/No" but then silently deletes nothing.
  const node = groupNode(page, name);
  if (await node.getAttribute('aria-selected') !== 'true') {
    await node.click();
    await waitForSpinner(page);
  }
  await expect(node).toHaveAttribute('aria-selected', 'true');
  await analysisMain(page).getByRole('button', { name: 'Delete selected analysis or group' }).click();
  const confirm = page.getByRole('dialog', { name: /Warning: Delete Analysis/ }).first();
  await expect(confirm).toBeVisible();
  const deleted = page.waitForResponse(r => r.url().includes('DeleteAnalysisGroup.gx'));
  await confirm.getByRole('button', { name: 'Yes', exact: true }).click();
  expect((await deleted).ok()).toBe(true);
  cleanup.done(`DeleteAnalysisGroup.gx?idAnalysisGroup=${id}`);

  await waitForSpinner(page);
  await expect(groupNode(page, name)).toHaveCount(0);
  await expectNoErrorDialog(page);
});
