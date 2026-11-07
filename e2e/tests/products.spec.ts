import { expect, Page, Request, test } from '@playwright/test';
import { enterApp } from './browse-pages';
import { waitForSpinner } from './helpers';
import { expectNoErrorDialog } from './tree-helpers';

// Products › Product Orders. Read-only: filters and views are changed, but Go (change status) and
// Delete are never pressed, and any Save/Delete request fails the test.

/** Opens Products › Product Orders, or skips if this user doesn't have it. */
async function openProductOrders(page: Page): Promise<void> {
  await enterApp(page);
  const products = page.locator('#main-nav').getByRole('button', { name: /^Products( \.\.\.)? menu$/ });
  test.skip(!(await products.isVisible()), 'this user has no Products menu');
  await products.click();
  const entry = page.getByRole('menuitem', { name: 'Product Orders', exact: true });
  test.skip(!(await entry.isVisible()), 'this user has no Product Orders page');
  await entry.click();
  await waitForSpinner(page);
  await expect(page.getByRole('button', { name: 'Display mode' }).or(page.getByRole('group', { name: 'Display mode' })).first())
    .toBeVisible();
}

/** Records requests that would change product orders. */
function watchChanges(page: Page): Request[] {
  const changes: Request[] = [];
  page.on('request', r => { if (/\/(Save|Delete|Change)\w*\.gx/i.test(new URL(r.url()).pathname)) changes.push(r); });
  return changes;
}

/** GNomEx's message when the order list can't be read. */
async function expectNoListError(page: Page): Promise<void> {
  await expect(page.getByRole('alertdialog').filter({ hasText: 'An error occurred while retrieving the product order list' }),
    'an empty order list is not an error').toHaveCount(0);
  await expectNoErrorDialog(page);
}

test('Product Orders lists the orders when it opens', async ({ page }) => {
  const listed = page.waitForRequest(r => r.url().includes('GetProductOrderList.gx'), { timeout: 30_000 }).catch(() => null);
  await openProductOrders(page);
  // Seen in the code 2026-11: the list is only requested when a filter changes, so the page may
  // open empty until the user touches a filter.
  expect(await listed, 'opening the page should request the order list').not.toBeNull();
  await waitForSpinner(page);
  await expectNoListError(page);
});

test('the Status filter asks for orders with that status', async ({ page }) => {
  const changes = watchChanges(page);
  await openProductOrders(page);
  const status = page.getByRole('combobox', { name: 'Status', exact: true });
  await status.click();
  const options = page.getByRole('option').filter({ hasNotText: /^\s*None\s*$/ });
  test.skip(await options.count() === 0, 'no product order statuses are defined');
  const listed = page.waitForRequest(r => r.url().includes('GetProductOrderList.gx'));
  await options.first().click();
  const params = new URL((await listed).url()).searchParams;
  expect(params.get('codeProductOrderStatus'), 'the chosen status is sent').toBeTruthy();
  await waitForSpinner(page);
  // Seen in the code 2026-11: a reply with no orders shows "An error occurred while retrieving
  // the product order list" instead of an empty list.
  await expectNoListError(page);
  expect(changes.map(r => r.url())).toEqual([]);
});

test('the Detail view shows the orders by lab', async ({ page }) => {
  const changes = watchChanges(page);
  await openProductOrders(page);
  await page.getByRole('button', { name: 'Detail', exact: true }).or(page.getByRole('radio', { name: 'Detail', exact: true })).first().click();
  const tree = page.getByRole('tree', { name: 'Product orders' });
  await expect(tree).toBeVisible();
  await expect(page.getByRole('button', { name: 'Delete', exact: true }), 'nothing selected to delete').toBeDisabled();

  const lab = tree.getByRole('treeitem').first();
  if (await lab.count()) {
    const name = (await lab.getAttribute('aria-label')) || '';
    await lab.click();
    await waitForSpinner(page);
    await expect(page.getByText(`Product Orders for ${name}`)).toBeVisible();
    await expect(page.getByRole('grid', { name: 'Lab product orders' }).or(page.locator('[aria-label="Lab product orders"]')).first()).toBeVisible();
  } else {
    test.info().annotations.push({ type: 'note', description: 'no product orders listed; only the empty view was checked' });
  }
  await expectNoListError(page);
  expect(changes.map(r => r.url()), 'nothing should be changed').toEqual([]);
});
