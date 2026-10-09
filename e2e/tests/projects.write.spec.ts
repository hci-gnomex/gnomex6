import { expect, Page, test } from '@playwright/test';
import { login, waitForSpinner } from './helpers';
import { expectNoErrorDialog } from './tree-helpers';
import { Cleanup, WRITE_LAB, idFromResponse, pickOption, requireWritableServer, uniqueName } from './write-helpers';

// Creates, renames and deletes projects in GNOMEX_WRITE_LAB. Changes data: local throwaway DB only.

const cleanup = new Cleanup();

test.beforeEach(async ({ page }) => {
  requireWritableServer();
  await login(page);
});

test.afterEach(async ({ page }) => {
  await cleanup.run(page);
});

/** Creates a project from Experiments > New Project; returns its id. */
async function createProject(page: Page, name: string): Promise<string> {
  await page.locator('#main-nav').getByRole('button', { name: 'Experiments menu', exact: true }).click();
  await page.getByRole('menuitem', { name: 'New Project', exact: true }).click();
  // Material's dialog container and GNomEx's inner dialog are both named "New Project".
  const dialog = page.getByRole('dialog', { name: 'New Project' }).first();
  await pickOption(page, dialog.getByRole('combobox', { name: 'Lab' }), WRITE_LAB);
  await dialog.getByRole('textbox', { name: 'Project name' }).fill(name);

  const saved = page.waitForResponse(r => r.url().includes('SaveProject.gx'));
  await dialog.getByRole('button', { name: 'Save', exact: true }).click();
  const response = await saved;
  expect(response.ok(), 'SaveProject.gx should succeed').toBe(true);
  const id = await idFromResponse(await response.text(), 'idProject');
  cleanup.add(`DeleteProject.gx?idProject=${id}`);

  await expect(dialog).toBeHidden();
  await expectNoErrorDialog(page);
  return id;
}

/** Browses the write lab with empty folders shown (new projects have no experiments yet). */
async function browseWriteLab(page: Page): Promise<void> {
  await page.locator('#main-nav').getByRole('button', { name: 'Experiments menu', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Browse Experiments', exact: true }).click();
  const filter = page.getByRole('main', { name: 'Experiments Browser' }).getByRole('search', { name: 'Browse filter' });
  await pickOption(page, filter.getByRole('combobox', { name: 'Select a lab...' }), WRITE_LAB);
  const listed = page.waitForResponse(r => r.url().includes('GetProjectRequestList.gx'));
  await filter.getByRole('button', { name: 'Search', exact: true }).click();
  await listed;
  await waitForSpinner(page);
  // The checkbox's label covers the input, so click the label text.
  const showEmpty = page.getByRole('checkbox', { name: 'Show Empty Folders' });
  if (!(await showEmpty.isChecked())) {
    await page.getByText('Show Empty Folders', { exact: true }).click();
    await expect(showEmpty).toBeChecked();
  }
  await waitForSpinner(page);
}

function projectNode(page: Page, name: string) {
  return page.getByRole('tree', { name: 'Experiments hierarchy' }).getByRole('treeitem', { name, exact: true });
}

async function openProject(page: Page, name: string, id: string): Promise<void> {
  await browseWriteLab(page);
  await projectNode(page, name).click();
  await waitForSpinner(page);
  await expect(page).toHaveURL(new RegExp(`/experiments/overview\\?.*idProject=${id}`));
  await expect(page.getByRole('main', { name: 'Browse Overview' }).getByRole('heading', { level: 1 }))
    .toHaveText(new RegExp(`^\\s*${name}\\s+\\(0 Experiments\\)\\s*$`));
}

test('a new project appears in its lab and opens', async ({ page }) => {
  const name = uniqueName('project');
  const id = await createProject(page, name);
  await openProject(page, name, id);
  await expectNoErrorDialog(page);
});

test('a project can be renamed', async ({ page }) => {
  const name = uniqueName('project');
  const id = await createProject(page, name);
  await openProject(page, name, id);

  const overview = page.getByRole('main', { name: 'Browse Overview' });
  await overview.getByRole('tab', { name: 'Project details tab' }).click();
  const details = overview.getByRole('tabpanel', { name: 'Project details tab' });
  await expect(details.getByRole('textbox', { name: 'Project Name' })).toHaveValue(name);
  const renamed = `${name}-renamed`;
  await details.getByRole('textbox', { name: 'Project Name' }).fill(renamed);

  const saved = page.waitForResponse(r => r.url().includes('SaveProject.gx'));
  await overview.getByRole('button', { name: 'Save', exact: true }).click();
  expect((await saved).ok()).toBe(true);
  await waitForSpinner(page);
  await expectNoErrorDialog(page);

  await expect(projectNode(page, renamed)).toHaveCount(1);
  await expect(projectNode(page, name)).toHaveCount(0);
  // Seen 2026-10: the tree updates but the overview heading keeps the old name until reselected.
  await expect.soft(overview.getByRole('heading', { level: 1 }), 'the heading should show the new name')
    .toContainText(renamed);
});

test('a project can be deleted from the tree', async ({ page }) => {
  const name = uniqueName('project');
  const id = await createProject(page, name);
  await openProject(page, name, id);

  await page.getByRole('button', { name: 'Delete selected project' }).click();
  const confirm = page.getByRole('dialog', { name: 'Warning: Delete Project' }).first();
  await expect(confirm.getByRole('alertdialog', { name: 'Confirm project deletion' })).toContainText(name);
  const deleted = page.waitForResponse(r => r.url().includes(`DeleteProject.gx?idProject=${id}`));
  await confirm.getByRole('button', { name: 'Yes', exact: true }).click();
  expect((await deleted).ok()).toBe(true);
  cleanup.done(`DeleteProject.gx?idProject=${id}`);

  await waitForSpinner(page);
  await expect(projectNode(page, name)).toHaveCount(0);
  // Seen 2026-10 while the write lab had no members (and was briefly inactive): the delete succeeded
  // but GNomEx then showed "INVALID: Insufficient permission to access this request or this lab".
  // Gone once the test account was a member of an active lab. Kept as a soft check.
  await expect.soft(page.getByRole('alertdialog', { name: /^(ERROR|INVALID)$/ }),
    'no error dialog should follow a successful delete').toHaveCount(0);
});
