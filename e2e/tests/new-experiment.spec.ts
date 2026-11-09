import { expect, Locator, Page, test } from '@playwright/test';
import { enterApp } from './browse-pages';
import { openMenuItem, pickRadio, waitForSpinner, watchChanges } from './helpers';
import { expectNoErrorDialog } from './tree-helpers';

// New Experiment Order: the first (Setup) step of the order wizard. Read-only: choices are made only
// to see the wizard react, the order is never submitted, and it's left with Cancel. Any
// Save/Submit request fails the test.

interface Wizard { wizard: Locator; setup: Locator; back: Locator; next: Locator; cancel: Locator }

/**
 * Opens the first "New Experiment Order for <core>" item (the menu lists one per core facility the
 * user may order from), or skips if the user has none. GetPropertyList.gx and GetOrganismList.gx
 * keep the "Please wait..." spinner up for a minute on a cold server.
 */
async function openWizard(page: Page): Promise<Wizard> {
  test.setTimeout(Math.max(test.info().timeout, 4 * 60_000));
  await enterApp(page);
  const menu = page.locator('#main-nav').getByRole('button', { name: 'New Experiment Order menu', exact: true });
  test.skip(!(await menu.isVisible()), 'this user may not order experiments');
  await menu.click();
  const item = page.getByRole('menuitem', { name: /^New Experiment Order for / }).first();
  const label = (await item.getAttribute('aria-label')) || (await item.innerText());
  const core = label.replace(/^New Experiment Order for /, '').trim();
  await page.keyboard.press('Escape');
  await openMenuItem(page, 'New Experiment Order', label.trim());
  await expect(page.locator('spinner-dialog')).toHaveCount(0, { timeout: 150_000 });

  const wizard = page.getByRole('region', { name: 'New Experiment Wizard' });
  await expect(wizard.getByRole('heading', { level: 1 })).toHaveText(`New Experiment for ${core}`);
  const nav = wizard.getByRole('toolbar', { name: 'Wizard navigation' });
  return {
    wizard,
    setup: wizard.getByRole('form', { name: 'Experiment setup form' }),
    back: nav.getByRole('button', { name: 'Go to previous step' }),
    next: nav.getByRole('button', { name: 'Go to next step' }),
    cancel: nav.getByRole('button', { name: 'Cancel and discard experiment' }),
  };
}

/** Picks a service category (Illumina Sequencing when offered, else the first) and returns its label. */
async function chooseCategory(page: Page, w: Wizard): Promise<string> {
  const group = w.setup.getByRole('radiogroup', { name: /Select a service category/ });
  const categories = group.getByRole('radio');
  test.skip(await categories.count() === 0, 'this core has no service categories to order');
  const illumina = group.getByRole('radio', { name: /^Illumina/ });
  const radio = (await illumina.count()) ? illumina.first() : categories.first();
  // The label reads "<name> <description>", e.g. "Illumina Sequencing Genomic seq, mRNA seq, ...".
  const name = (await radio.locator('xpath=ancestor::label[1]').innerText()).replace(/\s+/g, ' ').trim();
  await pickRadio(radio);
  await waitForSpinner(page);
  return name;
}

/** The "The experiment has not been saved. Are you sure you want to quit?" question. */
function quitQuestion(page: Page): Locator {
  return page.getByRole('alertdialog').filter({ hasText: 'The experiment has not been saved' });
}

test('the order wizard opens on its Setup step with Back and Next disabled', async ({ page }) => {
  const changes = watchChanges(page);
  const w = await openWizard(page);
  await expect(page).toHaveTitle(/ — GNomEx$/);
  await expect(w.wizard.getByRole('tab', { name: 'Initial setup step' })).toHaveAttribute('aria-selected', 'true');
  await expect(w.wizard.getByRole('tab'), 'only Setup until a service category is chosen').toHaveCount(1);
  await expect(w.back, 'nothing to go back to').toBeDisabled();
  await expect(w.next, 'nothing chosen yet').toBeDisabled();
  await expect(w.setup.getByRole('radio', { checked: true }), 'no category is preselected').toHaveCount(0);
  await expectNoErrorDialog(page);
  expect(changes.map(r => r.url()), 'nothing should be saved').toEqual([]);
});

test('choosing a service category names the experiment, lists the later steps and asks for a lab', async ({ page }) => {
  const changes = watchChanges(page);
  const w = await openWizard(page);
  const category = await chooseCategory(page, w);

  // The category's own label is "<name> <description>"; the heading uses the name.
  const heading = w.wizard.getByRole('heading', { level: 1 });
  await expect(heading).toHaveText(/^\s*New .+ Experiment for /);
  const shortName = ((await heading.innerText()).trim().match(/^New (.+) Experiment for /) || [])[1] || '';
  expect(category.startsWith(shortName), `the heading names "${category}"`).toBe(true);

  const tabs = w.wizard.getByRole('tab');
  await expect.poll(() => tabs.count(), 'the order\'s later steps are listed').toBeGreaterThan(1);
  const later = await tabs.evaluateAll(els => els.slice(1).map(e => ({
    name: (e.getAttribute('aria-label') || e.textContent || '').trim(),
    disabled: e.getAttribute('aria-disabled') === 'true',
  })));
  test.info().annotations.push({ type: 'steps', description: later.map(t => t.name).join(', ') });
  expect(later.filter(t => !t.disabled).map(t => t.name), 'later steps wait until Setup is complete').toEqual([]);
  await expect(w.wizard.getByRole('tab').last(), 'the order ends with Confirm').toHaveAccessibleName(/Confirm/);

  await expect(w.setup.getByRole('group', { name: 'Lab group selection' })).toBeVisible();
  await expect(w.next, 'a lab is still needed').toBeDisabled();
  await expectNoErrorDialog(page);
  expect(changes.map(r => r.url()), 'nothing should be saved').toEqual([]);
});

test('choosing a lab asks for a payment method, and an account asks for a project', async ({ page }) => {
  const changes = watchChanges(page);
  const w = await openWizard(page);
  await chooseCategory(page, w);
  const lab = w.setup.getByRole('group', { name: 'Lab group selection' }).getByRole('combobox');
  await lab.click();
  const labs = page.getByRole('option').filter({ hasNotText: /^\s*None\s*$/ });
  test.skip(await labs.count() === 0, 'this user belongs to no lab that can order');
  const labName = (await labs.first().innerText()).trim();
  await labs.first().click();
  await waitForSpinner(page);
  await expect(lab).toHaveValue(labName);

  const payment = w.setup.getByRole('group', { name: 'Payment method selection' });
  await expect(payment, "the lab's billing accounts are offered").toBeVisible();
  const project = w.setup.getByRole('group', { name: 'Project folder selection' });
  await expect(project, 'the project comes after the payment method').toHaveCount(0);
  await expect(w.next, 'a payment method is still needed').toBeDisabled();

  // Material 9's mat-select has role listbox (later versions: combobox).
  await payment.getByRole('listbox').or(payment.getByRole('combobox')).first().click();
  const accounts = page.getByRole('option').filter({ hasNotText: /^\s*None\s*$/ });
  if (await accounts.count() === 0) {
    await page.keyboard.press('Escape');
    test.info().annotations.push({ type: 'note', description: `${labName} has no billing accounts here; stopped before the project step` });
  } else {
    await accounts.first().click();
    await waitForSpinner(page);
    await expect(project, "the lab's projects are offered").toBeVisible();
    await expect(project.getByRole('button', { name: 'Create new project' })).toBeEnabled();
    await expect(project.getByRole('button', { name: 'Edit selected project' }), 'no project chosen to edit').toBeDisabled();
  }
  await expectNoErrorDialog(page);
  expect(changes.map(r => r.url()), 'nothing should be saved').toEqual([]);
});

test('Cancel asks before discarding the order: No stays, Yes goes Home', async ({ page }) => {
  const changes = watchChanges(page);
  const w = await openWizard(page);
  await chooseCategory(page, w);

  await w.cancel.click();
  const question = quitQuestion(page);
  await expect(question).toBeVisible();
  await question.getByRole('button', { name: 'No', exact: true }).click();
  await expect(question).toBeHidden();
  await expect(w.wizard, 'still in the wizard').toBeVisible();
  await expect(w.setup.getByRole('radio', { checked: true }), 'the choice is kept').toHaveCount(1);

  await w.cancel.click();
  await question.getByRole('button', { name: 'Yes', exact: true }).click();
  await page.waitForURL(/\/home(\?|$)/);
  await expect(w.wizard).toHaveCount(0);
  await expectNoErrorDialog(page);
  expect(changes.map(r => r.url()), 'nothing should be saved').toEqual([]);
});
