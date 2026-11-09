import { expect, Locator, Page, test } from '@playwright/test';
import { enterApp, LAB } from './browse-pages';
import { openMenuItem, pickRadio, waitForSpinner, watchChanges } from './helpers';
import { expectNoErrorDialog } from './tree-helpers';
import { WRITE_LAB } from './write-helpers';

// Experiments › New Billing Account ("Submit Campus Billing Account"). Read-only: the form is filled
// in only to see Save enable and the checks react; Save is never pressed, the dialog is closed with
// Cancel, and any Save/Submit request fails the test.

/** Opens the dialog and waits for its lab list (all labs, so it can take a while). */
async function openBillingAccount(page: Page): Promise<Locator> {
  await enterApp(page);
  const labs = page.waitForResponse(r => r.url().includes('GetLabList.gx'), { timeout: 120_000 });
  await openMenuItem(page, 'Experiments', 'New Billing Account');
  await labs;
  await waitForSpinner(page);
  // Material's dialog container and GNomEx's inner dialog share the name; take the inner one.
  const dialog = page.getByRole('dialog', { name: 'Submit Campus Billing Account', exact: true });
  await expect(dialog.getByRole('form', { name: 'New billing account form' })).toBeVisible();
  return dialog;
}

/**
 * Picks the first configured lab this list has (GNOMEX_WRITE_LAB, then GNOMEX_LAB), else the first
 * lab listed. The list is GNomEx's "unbounded" lab list, which can leave out a lab the user is in
 * (seen 2026-11: the write-test lab wasn't offered).
 */
async function chooseLab(page: Page, dialog: Locator): Promise<string> {
  await dialog.getByRole('combobox', { name: 'Lab', exact: true }).click();
  const listed = page.getByRole('option').filter({ hasNotText: /^\s*None\s*$/ });
  await expect(listed.first(), 'labs are listed').toBeVisible();
  let option = listed.first();
  for (const wanted of [WRITE_LAB, LAB].filter(Boolean)) {
    const match = page.getByRole('option', { name: wanted, exact: true });
    if (await match.count()) {
      option = match.first();
      break;
    }
  }
  const name = (await option.innerText()).trim();
  await option.click();
  await waitForSpinner(page);
  return name;
}

/** Types a value and leaves the field, so its check runs. */
async function enter(field: Locator, value: string): Promise<void> {
  await field.fill(value);
  await field.blur();
}

test('the form opens empty, for a Chartfield account, with Save disabled', async ({ page }) => {
  const changes = watchChanges(page);
  const dialog = await openBillingAccount(page);
  await expect(dialog.getByRole('radio', { name: 'Chartfield' }), 'Chartfield is the default').toBeChecked();
  await expect(dialog.getByRole('group', { name: 'Chartfield account details' })).toBeVisible();
  await expect(dialog.getByRole('textbox', { name: 'Start Date' }), 'starts today').not.toHaveValue('');
  await expect(dialog.getByRole('textbox', { name: 'Your Email Address' }), 'the user\'s email is filled in')
    .toHaveValue(/^[^@\s]+@[^@\s]+\.[a-z]+$/i);
  await expect(dialog.getByRole('checkbox', { name: 'I agree to the billing authorization terms' })).not.toBeChecked();
  await expect(dialog.getByRole('button', { name: 'Save', exact: true })).toBeDisabled();
  await expect(dialog.getByRole('combobox', { name: 'Select Core Facilities filter' }), 'core facilities wait for a lab').toBeDisabled();

  const lab = await chooseLab(page, dialog);
  await expect(dialog.getByRole('combobox', { name: 'Lab', exact: true })).toHaveValue(lab);
  await expect(dialog.getByRole('combobox', { name: 'Select Core Facilities filter' }), 'the lab\'s cores can be chosen').toBeEnabled();

  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expectNoErrorDialog(page);
  expect(changes.map(r => r.url()), 'no account should be submitted').toEqual([]);
});

test('Chartfield segments must have the right number of digits', async ({ page }) => {
  const changes = watchChanges(page);
  const dialog = await openBillingAccount(page);
  const details = dialog.getByRole('group', { name: 'Chartfield account details' });
  // [field, too short, letters, right length]
  const segments: [string, string, string, string][] = [
    ['Bus', '1', 'ab', '12'],
    ['Org', '1234', 'abcde', '12345'],
    ['Fund', '123', 'abcd', '1234'],
    ['Account', '6430', 'abcde', '64300'],
  ];
  for (const [name, short, letters, good] of segments) {
    await test.step(name, async () => {
      const field = details.getByRole('textbox', { name, exact: true });
      await enter(field, short);
      await expect(field, `${name} "${short}" is too short`).toHaveAttribute('aria-invalid', 'true');
      await enter(field, letters);
      await expect(field, `${name} takes digits only`).toHaveAttribute('aria-invalid', 'true');
      await enter(field, good);
      await expect(field, `${name} "${good}" is accepted`).toHaveAttribute('aria-invalid', 'false');
    });
  }

  // Activity (5 digits) or Project (8 digits): one of the two is needed.
  const activity = details.getByRole('textbox', { name: 'Activity', exact: true });
  const project = details.getByRole('textbox', { name: 'Project', exact: true });
  await enter(activity, '');
  await enter(project, '');
  await expect(activity, 'Activity or Project is needed').toHaveAttribute('aria-invalid', 'true');
  await enter(project, '12345678');
  await expect(project).toHaveAttribute('aria-invalid', 'false');
  await expect(activity, 'a Project is enough').toHaveAttribute('aria-invalid', 'false');
  await enter(project, '1234567');
  await expect(project, 'a Project has 8 digits').toHaveAttribute('aria-invalid', 'true');

  await expectNoErrorDialog(page);
  expect(changes.map(r => r.url()), 'no account should be submitted').toEqual([]);
});

test('Save enables only once the form is complete and the terms are agreed to', async ({ page }) => {
  const changes = watchChanges(page);
  const dialog = await openBillingAccount(page);
  const save = dialog.getByRole('button', { name: 'Save', exact: true });
  const details = dialog.getByRole('group', { name: 'Chartfield account details' });

  await chooseLab(page, dialog);
  await enter(details.getByRole('textbox', { name: 'Account Name', exact: true }), 'e2e test account');
  await enter(details.getByRole('textbox', { name: 'Short Account Name', exact: true }), 'e2e test');
  await enter(details.getByRole('textbox', { name: 'Bus', exact: true }), '01');
  await enter(details.getByRole('textbox', { name: 'Org', exact: true }), '12345');
  await enter(details.getByRole('textbox', { name: 'Fund', exact: true }), '1234');
  await enter(details.getByRole('textbox', { name: 'Activity', exact: true }), '12345');
  // Expiration Date is read-only; pick it in the calendar, which opens on today: a month ahead.
  const expiration = details.getByRole('textbox', { name: 'Expiration Date' });
  await expect(expiration, 'dates are picked from the calendar').not.toBeEditable();
  await details.getByRole('button', { name: 'Open calendar' }).last().click();
  const calendar = page.getByRole('dialog').filter({ has: page.getByRole('grid') }).last();
  await expect(calendar).toBeVisible();
  await page.keyboard.press('PageDown');
  await page.keyboard.press('Enter');
  await expect(calendar).toBeHidden();
  await expect(expiration).not.toHaveValue('');
  await expect(save, 'the terms are not agreed to yet').toBeDisabled();

  const agree = dialog.getByRole('checkbox', { name: 'I agree to the billing authorization terms' });
  await agree.locator('xpath=ancestor::label[1]').click();
  await expect(agree).toBeChecked();
  await expect(save, 'everything required is filled in').toBeEnabled();

  await enter(details.getByRole('textbox', { name: 'Short Account Name', exact: true }), 'more than ten characters');
  await expect(save, 'a short name over 10 characters').toBeDisabled();
  await enter(details.getByRole('textbox', { name: 'Short Account Name', exact: true }), 'e2e test');
  await expect(save).toBeEnabled();

  await enter(details.getByRole('textbox', { name: 'Your Email Address' }), 'not an email');
  await expect(save, 'a bad email address').toBeDisabled();

  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expectNoErrorDialog(page);
  expect(changes.map(r => r.url()), 'no account should be submitted').toEqual([]);
});

test('choosing PO swaps the Chartfield segments for purchase order details', async ({ page }) => {
  const changes = watchChanges(page);
  const dialog = await openBillingAccount(page);
  await pickRadio(dialog.getByRole('radio', { name: 'PO', exact: true }));
  await expect(dialog.getByRole('group', { name: 'Purchase order account details' })).toBeVisible();
  await expect(dialog.getByRole('group', { name: 'Chartfield account details' })).toHaveCount(0);
  await expect(dialog.getByRole('textbox', { name: 'Bus', exact: true }), 'no chartfield segments for a PO').toHaveCount(0);
  await expect(dialog.getByRole('textbox', { name: 'Account Name', exact: true })).toBeVisible();

  await pickRadio(dialog.getByRole('radio', { name: 'Chartfield', exact: true }));
  await expect(dialog.getByRole('textbox', { name: 'Bus', exact: true }), 'back to Chartfield').toBeVisible();
  await dialog.getByRole('button', { name: 'Close dialog' }).click();
  await expect(dialog).toHaveCount(0);
  await expectNoErrorDialog(page);
  expect(changes.map(r => r.url()), 'no account should be submitted').toEqual([]);
});
