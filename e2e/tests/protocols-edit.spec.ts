import { expect, Locator, Page, test } from '@playwright/test';
import { enterApp } from './browse-pages';
import { waitForSpinner, watchChanges } from './helpers';
import { expectNoErrorDialog } from './tree-helpers';

// The Protocols page (a main-menu item, or Configure › Protocols): what a protocol's form allows and
// checks, View URL, and the New Protocol dialog. Read-only: Save, Create Protocol and Delete Protocol
// are never pressed, and any Save/Delete/... request fails the test.

interface ListedProtocol { id: string; label: string; protocolClassName: string; canUpdate: string; canDelete: string }
interface ProtocolFolder { label: string; protocolClassName: string; Protocol?: ListedProtocol | ListedProtocol[] }

const ANALYSIS_PROTOCOL = 'hci.gnomex.model.AnalysisProtocol';

/** Opens the Protocols page and returns the protocol list it loaded (GetProtocolList.gx). */
async function openProtocols(page: Page): Promise<ProtocolFolder[]> {
  await enterApp(page);
  const list = page.waitForResponse(r => /GetProtocolList\.gx/.test(r.url()), { timeout: 120_000 });
  const nav = page.locator('#main-nav');
  const own = nav.getByRole('button', { name: 'Protocols', exact: true });
  if (await own.isVisible()) {
    await own.click();
  } else {
    const configure = nav.getByRole('button', { name: /^Configure( \.\.\.)? menu$/ });
    test.skip(!(await configure.isVisible()), 'this user has no Protocols page');
    await configure.click();
    await page.getByRole('menuitem', { name: /^(Manage )?Protocols$/ }).click();
  }
  const folders: ProtocolFolder[] = [].concat(await (await list).json());
  await waitForSpinner(page);
  await expect(page.getByRole('tree', { name: 'Protocols' }).getByRole('treeitem').first()).toBeVisible();
  return folders;
}

function protocolsIn(folder: ProtocolFolder): ListedProtocol[] {
  return ([] as ListedProtocol[]).concat(folder.Protocol || []);
}

/** Clicks a protocol in the tree and waits for its form. */
async function selectProtocol(page: Page, p: ListedProtocol): Promise<Locator> {
  const loaded = page.waitForResponse(r => /GetProtocol\.gx/.test(r.url()) && r.url().includes(`id=${p.id}&`));
  await page.getByRole('tree', { name: 'Protocols' }).getByRole('treeitem', { name: p.label, exact: true }).first().click();
  await loaded;
  await waitForSpinner(page);
  const form = page.getByRole('form', { name: 'Edit Protocol' });
  await expect(form.getByRole('textbox').first()).toHaveValue(p.label);
  return form;
}

/** Tells the browser the user may change every protocol (canUpdate "Y"); the server still checks on save. */
async function fakeCanUpdate(page: Page): Promise<void> {
  await page.route(/\/GetProtocol\.gx/, async route => {
    const response = await route.fetch();
    const body = (await response.text()).replace(/("canUpdate"\s*:\s*)"N"/g, '$1"Y"');
    await route.fulfill({ response, body });
  });
}

const saveButton = (page: Page) => page.getByRole('main').getByRole('button', { name: 'Save', exact: true });
const unsavedNote = (page: Page) => page.getByRole('main').getByText('Your changes have not been saved');

test('a protocol the user may not change opens read-only, with Save, New and Delete off', async ({ page }) => {
  const changes = watchChanges(page);
  const folders = await openProtocols(page);
  const folder = folders.find(f => f.protocolClassName !== ANALYSIS_PROTOCOL && protocolsIn(f).some(p => p.canUpdate === 'N'));
  test.skip(!folder, 'the user may change every non-analysis protocol');
  const protocol = protocolsIn(folder!).find(p => p.canUpdate === 'N')!;
  const form = await selectProtocol(page, protocol);

  await expect(page.getByRole('main')).toContainText(`${folder!.label}: ${protocol.label}`);
  const name = form.getByRole('textbox').first();
  await expect(name, 'the name is read-only').not.toBeEditable();
  await expect(form.getByRole('textbox', { name: 'URL' })).not.toBeEditable();
  await expect(saveButton(page)).toBeDisabled();
  await expect(unsavedNote(page)).toHaveCount(0);
  const list = page.getByRole('region', { name: 'Protocols' });
  if (protocol.canDelete === 'N') {
    await expect(list.getByRole('button', { name: 'Delete Protocol' })).toBeDisabled();
  }
  await expectNoErrorDialog(page);
  expect(changes.map(r => r.url())).toEqual([]);
});

test('the protocol name box is named for a protocol', async ({ page }) => {
  const folders = await openProtocols(page);
  const protocol = folders.flatMap(protocolsIn)[0];
  test.skip(!protocol, 'there are no protocols');
  const form = await selectProtocol(page, protocol);
  // Seen 2026-11: the box (and its errors) said "Account Name*", copied from the billing account form.
  // Fixed in edit-protocol.component.html.
  await expect(form.getByRole('textbox', { name: /^Protocol Name/ })).toHaveValue(protocol.label);
});

test('the protocol form checks the name and turns Save on only for a valid change', async ({ page }) => {
  const changes = watchChanges(page);
  await fakeCanUpdate(page);
  const folders = await openProtocols(page);
  const protocol = folders.flatMap(protocolsIn)[0];
  test.skip(!protocol, 'there are no protocols');
  const form = await selectProtocol(page, protocol);
  const name = form.getByRole('textbox').first();
  await expect(name).toBeEditable();
  await expect(saveButton(page), 'nothing changed yet').toBeDisabled();

  await name.fill('');
  await name.blur();
  await expect(form.getByText(/Name is required/).last()).toBeVisible();
  await expect(name).toHaveAttribute('aria-invalid', 'true');
  await expect(saveButton(page), 'no Save without a name').toBeDisabled();
  await expect(unsavedNote(page)).toBeVisible();

  await name.fill('e2e-'.padEnd(201, 'x'));
  await name.blur();
  await expect(name).toHaveAttribute('aria-invalid', 'true');
  await expect(saveButton(page), 'no Save with a name over 200 characters').toBeDisabled();
  // Seen 2026-11: the template asked for a "maxLength" error, but Angular calls it "maxlength", so
  // the box turned red with no message saying why (the URL box too). Fixed in edit-protocol.component.html.
  await expect.soft(form.getByText(/200 character limit/), 'the limit is explained').toBeVisible();

  await name.fill(`${protocol.label} e2e`);
  await expect(name).toHaveAttribute('aria-invalid', 'false');
  await expect(saveButton(page), 'a valid change can be saved').toBeEnabled();
  await expect(unsavedNote(page)).toBeVisible();
  expect(changes.map(r => r.url()), 'nothing should be saved').toEqual([]);
});

test('View URL is on only with a URL, and opens it in a new tab', async ({ page, context }) => {
  const changes = watchChanges(page);
  const appOrigin = new URL(test.info().project.use.baseURL!).origin;
  await context.route(url => url.origin !== appOrigin, route => route.fulfill({ contentType: 'text/html', body: '<title>stub</title>' }));
  await fakeCanUpdate(page);
  const folders = await openProtocols(page);
  const protocol = folders.flatMap(protocolsIn)[0];
  test.skip(!protocol, 'there are no protocols');
  const form = await selectProtocol(page, protocol);
  const url = form.getByRole('textbox', { name: 'URL' });
  const view = form.getByRole('button', { name: 'View URL' });

  const target = 'https://example.org/e2e-protocol';
  await url.fill('');
  await expect(view, 'no URL, nothing to view').toBeDisabled();
  await url.fill(target);
  await expect(view).toBeEnabled();
  const tab = context.waitForEvent('page');
  await view.click();
  const opened = await tab;
  await expect.poll(() => opened.url()).toBe(target);
  await opened.close();
  await url.fill('');
  await expect(view).toBeDisabled();
  expect(changes.map(r => r.url()), 'nothing should be saved').toEqual([]);
});

test('New Protocol, for an analysis protocol, needs a name and Cancel creates nothing', async ({ page }) => {
  const changes = watchChanges(page);
  const folders = await openProtocols(page);
  const list = page.getByRole('region', { name: 'Protocols' });
  const newButton = list.getByRole('button', { name: 'New Protocol' });
  await expect(newButton, 'off until a protocol type is chosen').toBeDisabled();

  // Anyone signed in may add analysis protocols; other kinds need dictionary rights.
  const analysis = folders.find(f => f.protocolClassName === ANALYSIS_PROTOCOL);
  test.skip(!analysis, 'there is no Analysis Protocol folder');
  await list.getByRole('treeitem', { name: analysis!.label, exact: true }).click();
  await expect(newButton).toBeEnabled();
  await newButton.click();

  // The Material container and the dialog's own content both have role=dialog; take the outer one.
  const dialog = page.getByRole('dialog').filter({ hasText: `Create New ${analysis!.label}` }).first();
  await expect(dialog).toBeVisible();
  const create = dialog.getByRole('button', { name: 'Create Protocol' });
  await expect(create, 'no name yet').toBeDisabled();
  await dialog.getByRole('textbox', { name: /Protocol Name/ }).fill(`e2e-never-created-${Date.now()}`);
  await expect(create).toBeEnabled();
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await expect(dialog).toBeHidden();
  await expectNoErrorDialog(page);
  expect(changes.map(r => r.url()), 'nothing should be created').toEqual([]);
});
