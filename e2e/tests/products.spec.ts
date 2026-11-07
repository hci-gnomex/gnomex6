import { expect, Page, Request, Response, test } from '@playwright/test';
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

/**
 * Checks the server's reply to an order list request, then the page. The server answers
 * {"result":"ERROR","message":...} with HTTP 200 when its query fails, so the status alone says nothing.
 */
async function expectListServed(response: Response): Promise<void> {
  const body = await response.text();
  const error = body.match(/"result"\s*:\s*"ERROR"[^}]*?"message"\s*:\s*"([^"]{0,120})/);
  expect(error ? error[1].trim() : null, 'GetProductOrderList.gx should not fail').toBeNull();
}

/** GNomEx's message when the order list can't be read. */
async function expectNoListError(page: Page): Promise<void> {
  await expect(page.getByRole('alertdialog').filter({ hasText: 'An error occurred while retrieving the product order list' }),
    'an empty order list is not an error').toHaveCount(0);
  await expectNoErrorDialog(page);
}

test('Product Orders lists the orders when it opens', async ({ page }) => {
  // The wait starts before sign-in, which alone can take most of a minute.
  const listed = page.waitForResponse(r => r.url().includes('GetProductOrderList.gx'), { timeout: 150_000 }).catch(() => null);
  await openProductOrders(page);
  // Seen 2026-11: the page only asked for the list when a filter changed, and the unfiltered query
  // failed on the server for non-admins ("unexpected token: AND", ProductOrderFilter), so it opened
  // empty. Fixed: the page loads the list on opening, and the query starts its criteria with WHERE.
  const response = await listed;
  expect(response, 'opening the page should request the order list').not.toBeNull();
  await expectListServed(response!);
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
  const listed = page.waitForResponse(r => r.url().includes('GetProductOrderList.gx'));
  await options.first().click();
  const response = await listed;
  const params = new URL(response.url()).searchParams;
  expect(params.get('codeProductOrderStatus'), 'the chosen status is sent').toBeTruthy();
  // Seen 2026-11: this check used to run before the reply arrived, so it missed the server's
  // "unexpected token: AND" error; it now waits for the reply and reads it.
  await expectListServed(response);
  await waitForSpinner(page);
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
