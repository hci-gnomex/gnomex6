import { expect, Page, test } from '@playwright/test';
import { login, waitForSpinner } from './helpers';
import { expectNoErrorDialog } from './tree-helpers';
import { Cleanup, WRITE_LAB, idFromResponse, pickOption, requireWritableServer, uniqueName } from './write-helpers';

// Creates, renames and deletes topics in GNOMEX_WRITE_LAB. Changes data: local throwaway DB only.

const cleanup = new Cleanup();

test.beforeEach(async ({ page }) => {
  requireWritableServer();
  await login(page);
});

test.afterEach(async ({ page }) => {
  await cleanup.run(page);
});

const topicsTree = (page: Page) => page.getByRole('tree', { name: 'Topics' });
const topicNode = (page: Page, name: string) => topicsTree(page).getByRole('treeitem', { name, exact: true });

async function openTopicsPage(page: Page): Promise<void> {
  await page.locator('#main-nav').getByRole('button', { name: 'Topics', exact: true }).click();
  await expect(topicsTree(page).getByRole('treeitem').first()).toBeVisible();
  await waitForSpinner(page);
}

/** Creates a top-level topic owned by the signed-in user; returns its id. */
async function createTopic(page: Page, name: string): Promise<string> {
  await openTopicsPage(page);
  // New Topic is enabled once the "Topics" root (or a topic) is selected.
  await topicsTree(page).getByRole('treeitem').first().click();
  await page.getByRole('button', { name: 'Create new topic' }).click();

  const dialog = page.getByRole('dialog', { name: 'Add New Top Level Topic' }).first();
  await dialog.getByRole('textbox', { name: 'Topic name' }).fill(name);
  await pickOption(page, dialog.getByRole('combobox', { name: 'Group' }), WRITE_LAB);
  // Owner choices are the lab's members; pick the first real person.
  const owner = dialog.getByRole('combobox', { name: 'Owner' });
  await owner.click();
  // The lab's members load after the group is picked; the list starts out as just "None".
  const people = page.getByRole('option').filter({ hasNotText: /^\s*None\s*$/ });
  await expect.poll(() => people.count(), { timeout: 10_000 }).toBeGreaterThan(0).catch(() => {});
  test.skip(await people.count() === 0, `${WRITE_LAB} has no members to own a topic; add the test account to it.`);
  await people.first().click();

  const saved = page.waitForResponse(r => r.url().includes('SaveTopic.gx'));
  await dialog.getByRole('button', { name: 'Save', exact: true }).click();
  const response = await saved;
  expect(response.ok(), 'SaveTopic.gx should succeed').toBe(true);
  const id = await idFromResponse(await response.text(), 'idTopic');
  cleanup.add(`DeleteTopic.gx?idTopic=${id}`);

  await expect(dialog).toBeHidden();
  await expectNoErrorDialog(page);
  return id;
}

async function openTopic(page: Page, name: string, id: string): Promise<void> {
  await expect(topicNode(page, name)).toHaveCount(1);
  await topicNode(page, name).click();
  await waitForSpinner(page);
  await expect(page).toHaveURL(new RegExp(`/topics/detail/\\d+\\?(.*&)?idTopic=${id}`));
  await expect(page.getByRole('region', { name: 'Topic details' })).toContainText(`Topic T${id} - ${name}`);
}

test('a new topic appears in the tree and opens', async ({ page }) => {
  const name = uniqueName('topic');
  const id = await createTopic(page, name);
  await openTopic(page, name, id);
  await expectNoErrorDialog(page);
});

test('a topic can be renamed', async ({ page }) => {
  const name = uniqueName('topic');
  const id = await createTopic(page, name);
  await openTopic(page, name, id);

  const details = page.getByRole('region', { name: 'Topic details' });
  const nameBox = details.getByRole('textbox', { name: 'Name' });
  await expect(nameBox).toBeEditable();
  const renamed = `${name}-renamed`;
  await nameBox.fill(renamed);

  const saved = page.waitForResponse(r => r.url().includes('SaveTopic.gx'));
  await page.getByRole('button', { name: 'Save', exact: true }).last().click();
  expect((await saved).ok()).toBe(true);
  await waitForSpinner(page);
  await expectNoErrorDialog(page);

  await expect(topicNode(page, renamed)).toHaveCount(1);
  await expect(topicNode(page, name)).toHaveCount(0);

  // Reopen it: the saved name must come back from the server.
  await topicNode(page, renamed).click();
  await waitForSpinner(page);
  await expect(details.getByRole('textbox', { name: 'Name' })).toHaveValue(renamed);
  // Seen 2026-10: the "Topic Tnn - name" heading keeps the old name, even after reselecting.
  await expect.soft(details, 'the topic heading should show the new name').toContainText(`Topic T${id} - ${renamed}`);
});

test('a topic can be deleted', async ({ page }) => {
  const name = uniqueName('topic');
  const id = await createTopic(page, name);
  await openTopic(page, name, id);

  await page.getByRole('button', { name: 'Delete topic' }).click();
  const confirm = page.getByRole('dialog').filter({ hasText: name }).first();
  await expect(confirm).toBeVisible();
  const deleted = page.waitForResponse(r => r.url().includes(`DeleteTopic.gx`) && r.url().includes(`idTopic=${id}`));
  await confirm.getByRole('button', { name: /^(Yes|OK|Delete)$/ }).first().click();
  expect((await deleted).ok()).toBe(true);
  cleanup.done(`DeleteTopic.gx?idTopic=${id}`);

  await waitForSpinner(page);
  await expect(topicNode(page, name)).toHaveCount(0);
  await expectNoErrorDialog(page);
});
