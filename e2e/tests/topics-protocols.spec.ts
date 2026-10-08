import { expect, Page, test } from '@playwright/test';
import { enterApp } from './browse-pages';
import { waitForSpinner } from './helpers';
import { expectNoErrorDialog, openFirstMatching } from './tree-helpers';

// Topics and Protocols pages. Read-only.

/** Opens a top-level page from the header, or skips if this user's menu doesn't have it. */
async function openPage(page: Page, item: string): Promise<void> {
  const button = page.locator('#main-nav').getByRole('button', { name: item, exact: true });
  test.skip(!(await button.isVisible()), `"${item}" isn't in this user's main menu`);
  await button.click();
  await waitForSpinner(page);
}

test.describe('topics', () => {
  test.beforeEach(async ({ page }) => {
    await enterApp(page);
    await openPage(page, 'Topics');
  });

  test('a topic opens with its details', async ({ page }) => {
    const tree = page.getByRole('tree', { name: 'Topics' });
    await expect(tree.getByRole('treeitem').first()).toBeVisible();
    // The first item is the "Topics" root; open the first topic below it.
    const topic = tree.getByRole('treeitem').nth(1);
    const name = await topic.getAttribute('aria-label');
    await topic.click();
    await waitForSpinner(page);

    await expect(page).toHaveURL(/\/topics\/detail\/\d+/);
    const details = page.getByRole('region', { name: 'Topic details' });
    await expect(details).toContainText(new RegExp(`Topic T\\d+ - ${name!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
    await expect(details.getByRole('tab', { name: 'Info' })).toHaveAttribute('aria-selected', 'true');
    await expect(details.getByRole('textbox', { name: 'Name' })).toHaveValue(name!);
    await details.getByRole('tab', { name: 'Visibility' }).click();
    await expect(details.getByRole('tabpanel', { name: 'Visibility' })).not.toBeEmpty();
    await expectNoErrorDialog(page);
  });

  test('items linked to a topic open inside the topics page', async ({ page }) => {
    const tree = page.getByRole('tree', { name: 'Topics' });
    const opened = await openFirstMatching(page, tree, /\/topics\/(datatrack|analysis|experiment)\/\d+/);
    test.skip(!opened, 'no topic has linked items the user can see');
    await expect(page.getByRole('region', { name: 'Topic details' })).not.toBeEmpty();
    await expectNoErrorDialog(page);
  });
});

test.describe('protocols', () => {
  test.beforeEach(async ({ page }) => {
    await enterApp(page);
    await openPage(page, 'Protocols');
  });

  test('a protocol opens with its details', async ({ page }) => {
    const tree = page.getByRole('tree', { name: 'Protocols' });
    await expect(tree.getByRole('treeitem').first()).toBeVisible();
    // Categories (expanded) come first; the protocols are the items without children.
    const protocol = tree.locator('[role=treeitem]:not([aria-expanded])').first();
    const name = await protocol.getAttribute('aria-label');
    await protocol.click();
    await waitForSpinner(page);

    await expect(page).toHaveURL(/browsePanel:details\//);
    await expect(page.getByRole('main')).toContainText(`Protocol: ${name}`);
    const form = page.getByRole('form', { name: 'Edit Protocol' });
    await expect(form.getByRole('combobox', { name: 'Experiment Platform' })).toBeVisible();
    await expect(form.getByRole('checkbox', { name: 'Active' })).toBeVisible();
    await expectNoErrorDialog(page);
  });
});
