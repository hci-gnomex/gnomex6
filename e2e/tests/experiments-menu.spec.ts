import { expect, Locator, Page, test } from '@playwright/test';
import { enterApp, LAB } from './browse-pages';
import { chooseOption, openMenuItem, pickRadio, waitForSpinner, watchChanges } from './helpers';
import { expectNoErrorDialog } from './tree-helpers';
import { WRITE_LAB } from './write-helpers';

// Experiments menu: New Project, Upload Experiment data and Add Additional Illumina Sequencing Lanes.
// Read-only: choices are made only to see the page react; Save and Submit are never pressed, each
// page is left with Cancel, and any Save/Submit request fails the test. (Creating a project for
// real is in projects.write.spec.ts.)

/** The labs the tests prefer, when a list has them. */
const LABS = [WRITE_LAB, LAB];

/**
 * Opens an Experiments menu item and gives its lab list (GetLabList.gx, ~0.5 MB) time to arrive.
 * Not every page asks for it (New Project reuses the list loaded at sign-in), so the wait is short;
 * chooseOption waits for the options themselves.
 */
async function openWithLabs(page: Page, item: string): Promise<void> {
  await enterApp(page);
  const labs = page.waitForResponse(r => r.url().includes('GetLabList.gx'), { timeout: 20_000 }).catch(() => null);
  await openMenuItem(page, 'Experiments', item);
  await labs;
  await waitForSpinner(page);
}

// ---- New Project ---------------------------------------------------------------------------------

test('New Project needs a lab and a name before it can be saved, and Cancel saves nothing', async ({ page }) => {
  const changes = watchChanges(page);
  await openWithLabs(page, 'New Project');
  const dialog = page.getByRole('dialog', { name: 'New Project', exact: true });
  const form = dialog.getByRole('form', { name: 'Create or edit project' });
  await expect(form).toBeVisible();
  const save = dialog.getByRole('button', { name: 'Save', exact: true });
  const name = form.getByRole('textbox', { name: 'Project name' });
  await expect(name).toHaveValue('');
  await expect(save, 'nothing filled in yet').toBeDisabled();

  const lab = await chooseOption(page, form.getByRole('combobox', { name: 'Select lab' }), LABS);
  expect(lab, 'labs are listed').not.toBeNull();
  await expect(save, 'a project needs a name').toBeDisabled();
  await name.fill(`e2e-unsaved-${Date.now()}`);
  await expect(save, 'lab and name are enough').toBeEnabled();
  await name.fill('');
  await expect(save, 'an empty name').toBeDisabled();

  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expectNoErrorDialog(page);
  expect(changes.map(r => r.url()), 'no project should be saved').toEqual([]);
});

// ---- Upload Experiment data -----------------------------------------------------------------------

test('Upload Experiment Data enables Next only once the lab, organism, platform, type and project are chosen', async ({ page }) => {
  const changes = watchChanges(page);
  await openWithLabs(page, 'Upload Experiment data');
  await expect(page).toHaveTitle('Upload Experiment Data — GNomEx');
  const setup = page.getByRole('tabpanel', { name: 'Setup' });
  const next = page.getByRole('button', { name: 'Next', exact: true });
  await expect(page.getByRole('tab', { name: 'Setup' })).toHaveAttribute('aria-selected', 'true');
  await expect(next, 'nothing chosen yet').toBeDisabled();
  await expect(page.getByRole('button', { name: 'Back', exact: true })).toBeDisabled();

  // Choosing a lab loads its projects.
  const lab = await chooseOption(page, setup.getByRole('combobox', { name: 'Lab group' }), LABS);
  expect(lab, 'labs are listed').not.toBeNull();
  const organism = await chooseOption(page, setup.getByRole('combobox', { name: 'Organism' }), ['Human', 'Homo sapiens']);
  expect(organism, 'organisms are listed').not.toBeNull();
  await expect(next, 'a platform, type and project are still needed').toBeDisabled();

  const platforms = setup.getByRole('radiogroup').first().getByRole('radio');
  test.skip(await platforms.count() === 0, 'no platforms to upload for');
  const illumina = setup.getByRole('radio', { name: /^Illumina/ });
  await pickRadio((await illumina.count()) ? illumina.first() : platforms.first());
  await waitForSpinner(page);
  const type = await chooseOption(page, setup.getByRole('combobox', { name: 'Experiment type' }));
  expect(type, 'the platform lists its experiment types').not.toBeNull();
  await expect(next, 'a project is still needed').toBeDisabled();

  const project = await chooseOption(page, setup.getByRole('combobox', { name: 'Project folder for organizing experiments' }));
  if (project === null) {
    test.info().annotations.push({ type: 'note', description: `${lab} has no projects; stopped before choosing one` });
  } else {
    await expect(setup.getByRole('button', { name: 'Edit', exact: true }), 'the chosen project can be edited').toBeEnabled();
    await expect(next, `${lab}, ${organism}, ${type}, ${project}: everything needed`).toBeEnabled();
  }

  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  const quit = page.getByRole('alertdialog');
  if (await quit.first().isVisible({ timeout: 3_000 }).catch(() => false)) {
    await quit.first().getByRole('button', { name: /^(Yes|OK|Ok)$/ }).click();
  }
  await expectNoErrorDialog(page);
  expect(changes.map(r => r.url()), 'nothing should be saved').toEqual([]);
});

// ---- Add Additional Illumina Sequencing Lanes ----------------------------------------------------

interface Amend { region: Locator; candidates: Locator; next: Locator; save: Locator }

async function openAddLanes(page: Page): Promise<Amend> {
  await openWithLabs(page, 'Add Additional Illumina Sequencing Lanes');
  await expect(page).toHaveTitle('Add Illumina Sequencing Lanes — GNomEx');
  const region = page.getByRole('region', { name: 'Amend Experiment' });
  const steps = region.getByRole('toolbar', { name: 'Navigation and actions' });
  return {
    region,
    candidates: region.getByRole('tree', { name: 'Candidate requests' }),
    next: steps.getByRole('button', { name: 'Go to next step' }),
    save: steps.getByRole('button', { name: 'Save experiment changes' }),
  };
}

/**
 * Picks a radio button and waits for the candidate list it asks for: the lab's experiments as a
 * tree, or GNomEx's "No experiments found" message (closed here). Returns the request's parameters.
 * The message is modal and hides the page from the accessibility tree, so the radio is checked
 * only after it closes.
 */
async function candidatesFor(page: Page, radio: Locator): Promise<URLSearchParams> {
  const listed = page.waitForResponse(r => r.url().includes('GetProjectRequestList.gx'));
  await radio.locator('xpath=ancestor::label[1]').click();
  const response = await listed;
  await waitForSpinner(page);
  const none = page.getByRole('alertdialog').filter({ hasText: 'No experiments found' });
  if (await none.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await none.getByRole('button', { name: /^(OK|Ok|Close)$/ }).first().click();
    await expect(none).toBeHidden();
  }
  await expect(radio).toBeChecked();
  return new URL(response.url()).searchParams;
}

test('Add Lanes lists a lab\'s Illumina experiments for the chosen period', async ({ page }) => {
  const changes = watchChanges(page);
  const a = await openAddLanes(page);
  await expect(a.next, 'no experiment chosen').toBeDisabled();
  await expect(a.save).toBeDisabled();
  await expect(a.region.getByRole('radio', { name: '3 months' }), 'the last 3 months by default').toBeChecked();

  const lab = await chooseOption(page, a.region.getByRole('combobox', { name: 'Verify your lab group' }), LABS);
  expect(lab, 'labs are listed').not.toBeNull();
  await expect(a.candidates.getByRole('treeitem'), 'nothing is listed until a service is chosen').toHaveCount(0);

  const category = a.region.getByRole('radio', { name: /Adding sequence lanes only/ }).first();
  test.skip(await category.count() === 0, 'no Illumina service to add lanes to');
  const first = await candidatesFor(page, category);
  expect(first.get('idLab'), `the list is for ${lab}`).toMatch(/^\d+$/);
  expect(first.get('codeRequestCategory'), 'for the chosen service').toBeTruthy();
  expect(first.get('isSolexa'), 'Illumina experiments only').toBe('Y');
  expect(first.get('lastThreeMonths'), 'from the last 3 months').toBe('Y');

  const year = await candidatesFor(page, a.region.getByRole('radio', { name: 'year', exact: true }));
  expect(year.get('lastYear'), 'the period follows the choice').toBe('Y');
  expect(year.get('lastThreeMonths'), 'the old period is dropped').toBeNull();

  // Experiments (not their lab or project folders) can be picked; doing so enables Next.
  const experiments = a.candidates.getByRole('treeitem').filter({ hasText: /\d+R\d*/ });
  if (await experiments.count()) {
    await experiments.first().click();
    await waitForSpinner(page);
    await expect(a.next, 'an experiment is chosen').toBeEnabled();
  } else {
    test.info().annotations.push({ type: 'note', description: `${lab} has no Illumina experiments from the last year` });
  }

  await a.region.getByRole('button', { name: 'Cancel and discard changes' }).click();
  const quit = page.getByRole('alertdialog');
  if (await quit.first().isVisible({ timeout: 3_000 }).catch(() => false)) {
    await quit.first().getByRole('button', { name: /^(Yes|OK|Ok)$/ }).click();
  }
  await expectNoErrorDialog(page);
  expect(changes.map(r => r.url()), 'nothing should be saved').toEqual([]);
});
