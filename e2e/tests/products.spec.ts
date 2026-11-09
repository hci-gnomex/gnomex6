import { expect, Locator, Page, Request, Response, test } from '@playwright/test';
import { enterApp, LAB } from './browse-pages';
import { chooseOption, openMenuItem, waitForSpinner, watchChanges as watchAnyChanges } from './helpers';
import { expectNoErrorDialog } from './tree-helpers';

// Products › Product Orders, Product Ledger and Order Products. Read-only: filters and views are
// changed, but Go (change status), Delete, Save and Submit are never pressed, and any Save/Delete
// request fails the test.

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

// ---- Product Ledger -------------------------------------------------------------------------------

/** Checks a ledger list reply isn't GNomEx's {"result":"ERROR"} (sent with HTTP 200). */
async function expectLedgerServed(response: Response): Promise<void> {
  const body = await response.text();
  const error = body.match(/"result"\s*:\s*"ERROR"[^}]*?"message"\s*:\s*"([^"]{0,120})/);
  expect(error ? error[1].trim() : null, 'GetProductLedgerList.gx should not fail').toBeNull();
}

test('the Product Ledger lists products by lab, filtered by the chosen lab and product', async ({ page }) => {
  const changes = watchAnyChanges(page);
  await enterApp(page);
  const opened = page.waitForResponse(r => r.url().includes('GetProductLedgerList.gx'), { timeout: 120_000 });
  await openMenuItem(page, 'Products', 'Product Ledger');
  await expectLedgerServed(await opened);
  await expect(page).toHaveTitle('Product Ledger — GNomEx');
  const main = page.locator('#main-content');
  await expect(main.getByRole('tree', { name: 'Products' })).toBeAttached();
  await expect(main.getByRole('button', { name: 'Save', exact: true }), 'nothing to save').toBeDisabled();

  let listed = page.waitForResponse(r => r.url().includes('GetProductLedgerList.gx'));
  const lab = await chooseOption(page, main.getByRole('combobox', { name: 'Lab', exact: true }), [LAB]);
  expect(lab, 'labs are listed').not.toBeNull();
  let response = await listed;
  expect(new URL(response.url()).searchParams.get('idLab'), `the list is for ${lab}`).toMatch(/^\d+$/);
  await expectLedgerServed(response);

  listed = page.waitForResponse(r => r.url().includes('GetProductLedgerList.gx'));
  const product = await chooseOption(page, main.getByRole('combobox', { name: 'Product', exact: true }));
  if (product === null) {
    test.info().annotations.push({ type: 'note', description: 'no products are defined' });
  } else {
    response = await listed;
    const params = new URL(response.url()).searchParams;
    expect(params.get('idProduct'), `the list is for ${product}`).toMatch(/^\d+$/);
    expect(params.get('idLab'), 'the lab filter is kept').toMatch(/^\d+$/);
    await expectLedgerServed(response);
  }
  await waitForSpinner(page);
  await expectNoErrorDialog(page);
  expect(changes.map(r => r.url()), 'nothing should be saved').toEqual([]);
});

// ---- Order Products -------------------------------------------------------------------------------

/** Reads "$12.50" as 12.5. */
function dollars(text: string): number {
  return Number(text.replace(/[^0-9.\-]/g, ''));
}

interface OrderForm { main: Locator; items: Locator; quantities: Locator; submit: Locator }

/**
 * Opens Products › Order Products for the first core listed, chooses a lab and a billing account,
 * and waits for the products. Skips if the user can't order or the core has nothing to order.
 */
async function openOrderForm(page: Page): Promise<OrderForm> {
  await enterApp(page);
  const nav = page.locator('#main-nav').getByRole('button', { name: /^Products( \.\.\.)? menu$/ });
  test.skip(!(await nav.isVisible()), 'this user has no Products menu');
  await nav.click();
  const submenu = page.getByRole('menuitem', { name: 'Order Products submenu' });
  test.skip(!(await submenu.isVisible()), 'this user may not order products');
  await submenu.hover();
  const labs = page.waitForResponse(r => r.url().includes('GetLabList.gx'), { timeout: 120_000 }).catch(() => null);
  await page.getByRole('menu').last().getByRole('menuitem').first().click();
  await labs;
  await waitForSpinner(page);
  await expect(page).toHaveTitle('Order Products — GNomEx');
  const main = page.locator('#main-content');
  await expect(main.getByRole('heading', { name: /^Order Products for / })).toBeVisible();
  const items = main.getByRole('table', { name: 'Product order items' });

  // Only labs that can order from this core are offered.
  const lab = await chooseOption(page, main.getByRole('combobox', { name: 'Lab group' }));
  test.skip(lab === null, 'the user has no lab that can order from this core');
  await expect(main.getByRole('combobox', { name: 'Billing account' }), "the lab's accounts are offered").toBeVisible();
  await expect(items, 'products wait for a billing account').toBeHidden();

  const account = await chooseOption(page, main.getByRole('combobox', { name: 'Billing account' }));
  test.skip(account === null, `${lab} has no billing account for this core`);
  await expect(items).toBeVisible();
  // The products fill in after GetProductList.gx returns.
  const quantities = items.getByRole('spinbutton');
  const hasProducts = await quantities.first().waitFor({ timeout: 15_000 }).then(() => true, () => false);
  test.skip(!hasProducts, 'this core has no products to order');
  return { main, items, quantities, submit: main.getByRole('button', { name: 'Submit', exact: true }) };
}

/** Orders `quantity` of the first product, checks its line total and the grand total, returns its price. */
async function expectTotals(page: Page, o: OrderForm, quantity: number): Promise<number> {
  const row = o.items.getByRole('row').filter({ has: page.getByRole('spinbutton') }).first();
  const price = dollars(await row.getByRole('cell').nth(2).innerText());
  await o.quantities.first().fill(String(quantity));
  await o.quantities.first().blur();
  await expect(row.getByRole('checkbox'), 'the product is selected').toBeChecked();
  await expect.poll(async () => dollars(await row.getByRole('cell').nth(3).innerText()), `${quantity} x $${price}`)
    .toBeCloseTo(quantity * price, 2);
  await expect.poll(async () => dollars(await o.main.getByText(/^Grand Total:/).innerText()), 'the grand total')
    .toBeCloseTo(quantity * price, 2);
  return price;
}

test('Order Products totals the chosen quantities and needs consent before Submit', async ({ page }) => {
  const changes = watchAnyChanges(page);
  const o = await openOrderForm(page);
  await expect(o.submit, 'nothing ordered yet').toBeDisabled();

  await expectTotals(page, o, 2);
  await expect(o.submit, "the charge needs the user's consent").toBeDisabled();

  const consent = o.main.getByRole('checkbox', { name: /I authorize the Core Facility to charge the account/ });
  await consent.locator('xpath=ancestor::label[1]').click();
  await expect(consent).toBeChecked();
  await expect(o.submit, 'a quantity and consent are enough').toBeEnabled();

  // A negative quantity counts as none.
  await o.quantities.first().fill('-3');
  await o.quantities.first().blur();
  await expect(o.quantities.first()).toHaveValue('0');
  await expect(o.submit, 'nothing left to order').toBeDisabled();

  await expectNoErrorDialog(page);
  expect(changes.map(r => r.url()), 'no order should be submitted').toEqual([]);
});

test('Order Products keeps the cents of a price in the totals', async ({ page }) => {
  // The products here may all cost whole dollars, so the product list is faked with $12.50 prices.
  // Seen 2026-11: totals used parseInt(unitPrice), so 2 x $12.50 showed $24. Fixed in
  // OrderProductsComponent.checkQuantity.
  await page.route(/GetProductList\.gx/, async route => {
    const response = await route.fetch();
    const body = (await response.text())
      .replace(/("unitPrice(?:Internal|ExternalAcademic|ExternalCommercial)"\s*:\s*)"[^"]*"/g, '$1"12.50"');
    await route.fulfill({ response, body });
  });
  const changes = watchAnyChanges(page);
  const o = await openOrderForm(page);
  const price = await expectTotals(page, o, 2);
  expect(price, 'the faked price is shown').toBeCloseTo(12.5, 2);
  await expectNoErrorDialog(page);
  expect(changes.map(r => r.url()), 'no order should be submitted').toEqual([]);
});
