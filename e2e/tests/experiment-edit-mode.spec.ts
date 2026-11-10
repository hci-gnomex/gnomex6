import { expect, Locator, Page, test } from '@playwright/test';
import { browsePages, enterApp, openBrowsePage } from './browse-pages';
import { watchChanges } from './helpers';
import { expectNoErrorDialog, openFirstMatching } from './tree-helpers';

// Edit mode on an experiment: Edit unlocks the name and description and View locks them again, and
// leaving with unsaved changes asks first. Nothing is saved: the name is changed only in the browser
// and discarded, Save is never pressed, and any Save/Delete/Submit/... request fails the test.

const experiments = browsePages.find(p => p.name === 'experiments')!;

interface Editable {
  detail: Locator; heading: Locator; edit: Locator; view: Locator; save: Locator;
  number: string; original: string;
}

/**
 * Opens the first experiment. If the user may not edit it (they don't own it or manage its lab),
 * the browser is told they may: canUpdate in GetRequest.gx is rewritten to "Y". That only shows the
 * Edit button; the server still checks on save, and these tests never save.
 */
async function openEditableExperiment(page: Page): Promise<Editable> {
  await enterApp(page);
  await openBrowsePage(page, experiments);
  const opened = await openFirstMatching(page, page.getByRole('tree', { name: experiments.tree }), /\/experiments\/detail\/\d+/);
  test.skip(!opened, "the user can't see any experiments");
  const detail = page.getByRole('region', { name: 'Experiment Detail Overview' });
  const heading = detail.getByRole('heading', { level: 1 });
  await expect(heading).toHaveText(/Experiment \S+/);
  const actions = detail.getByRole('toolbar', { name: 'Experiment actions' });
  const edit = actions.getByRole('button', { name: 'Switch to edit mode' });
  if (!(await edit.isVisible())) {
    test.info().annotations.push({ type: 'note', description: `${opened}: not editable by this user, so canUpdate was faked in the browser` });
    await page.route(/\/GetRequest\.gx/, async route => {
      const response = await route.fetch();
      const body = (await response.text()).replace(/("canUpdate"\s*:\s*)"N"/g, '$1"Y"');
      await route.fulfill({ response, body });
    });
    await page.reload();
    await expect(edit).toBeVisible({ timeout: 90_000 });
  }
  // The Overview tab shows the saved name as text.
  const name = detail.getByRole('tabpanel', { name: 'Overview tab' }).getByRole('group', { name: 'Name', exact: true });
  await expect(name).toContainText(/\S/);
  return {
    detail, heading, edit,
    view: actions.getByRole('button', { name: 'Switch to view mode' }),
    save: page.getByRole('region', { name: 'Save footer' }).getByRole('button', { name: /^Save/ }),
    number: (await heading.innerText()).replace(/^\s*(External )?Experiment\s*/, '').trim(),
    original: (await name.innerText()).replace(/^\s*Name\s*/, '').trim(),
  };
}

/** Opens the Description tab and returns its panel. */
async function descriptionTab(e: Editable): Promise<Locator> {
  await e.detail.getByRole('tab', { name: 'Description tab' }).click();
  const panel = e.detail.getByRole('tabpanel', { name: 'Description tab' });
  await expect(panel).toBeVisible();
  return panel;
}

function nameBox(panel: Locator): Locator {
  return panel.getByRole('textbox', { name: 'Experiment Name' });
}

/** The "Your changes haven't been saved. Continue anyway?" question. */
function unsavedQuestion(page: Page): Locator {
  return page.getByRole('alertdialog').filter({ hasText: "Your changes haven't been saved" });
}

test('Edit unlocks the experiment name and View locks it again', async ({ page }) => {
  const changes = watchChanges(page);
  const e = await openEditableExperiment(page);
  await expect(e.save, 'Save is off in view mode').toBeDisabled();
  let panel = await descriptionTab(e);
  await expect(nameBox(panel), 'no name box in view mode').toHaveCount(0);

  await e.edit.click();
  await expect(e.view).toBeVisible();
  await expect(e.heading, 'the heading says the experiment is being edited').toHaveText(/^\s*Edit .*Experiment\s*$/);
  panel = await descriptionTab(e);
  await expect(nameBox(panel)).toBeEditable();
  await expect(nameBox(panel), 'the box holds the saved name').toHaveValue(e.original);
  await expect(e.save, 'Save is on in edit mode').toBeEnabled();

  // No changes, so switching back needs no confirmation.
  await e.view.click();
  await expect(unsavedQuestion(page)).toHaveCount(0);
  await expect(e.edit).toBeVisible();
  await expect(e.heading).toHaveText(new RegExp(`Experiment ${e.number}\\s*$`));
  await expect(nameBox(panel)).toHaveCount(0);
  await expect(e.save).toBeDisabled();
  await expectNoErrorDialog(page);
  expect(changes.map(r => r.url())).toEqual([]);
});

test('a name over 200 characters is flagged and turns Save off', async ({ page }) => {
  const changes = watchChanges(page);
  const e = await openEditableExperiment(page);
  await e.edit.click();
  const panel = await descriptionTab(e);
  const box = nameBox(panel);
  await box.fill('e2e-'.padEnd(201, 'x'));
  await box.blur();
  await expect(panel.getByRole('alert').filter({ hasText: /at most 200/ })).toBeVisible();
  await expect(box).toHaveAttribute('aria-invalid', 'true');
  await expect(e.save).toBeDisabled();

  await box.fill(e.original);
  await expect(e.save).toBeEnabled();
  await e.view.click();
  const question = unsavedQuestion(page);
  if (await question.isVisible().catch(() => false)) {
    await question.getByRole('button', { name: 'Yes', exact: true }).click();
  }
  await expect(e.edit).toBeVisible();
  expect(changes.map(r => r.url()), 'nothing should be saved').toEqual([]);
});

test('leaving edit mode with an unsaved name asks first; No keeps editing, Yes discards it', async ({ page }) => {
  const changes = watchChanges(page);
  const e = await openEditableExperiment(page);
  await e.edit.click();
  let panel = await descriptionTab(e);
  const edited = `e2e-unsaved-${Date.now()}`;
  await nameBox(panel).fill(edited);

  await e.view.click();
  const question = unsavedQuestion(page);
  await expect(question).toBeVisible();
  await question.getByRole('button', { name: 'No', exact: true }).click();
  await expect(question).toBeHidden();
  await expect(e.view, 'still in edit mode').toBeVisible();
  await expect(nameBox(panel), 'the edit is kept').toHaveValue(edited);

  await e.view.click();
  await expect(question).toBeVisible();
  await question.getByRole('button', { name: 'Yes', exact: true }).click();
  await expect(question).toBeHidden();
  await expect(e.edit, 'back in view mode').toBeVisible();

  // The discarded name must not come back, either on the Overview or when editing again.
  const overviewName = e.detail.getByRole('tabpanel', { name: 'Overview tab' }).getByRole('group', { name: 'Name', exact: true });
  await e.detail.getByRole('tab', { name: 'Overview tab' }).click();
  await expect(overviewName).not.toContainText(edited);
  await e.edit.click();
  panel = await descriptionTab(e);
  await expect(nameBox(panel), 'editing again starts from the saved name').toHaveValue(e.original);
  await e.view.click();
  await expect(e.edit).toBeVisible();
  await expectNoErrorDialog(page);
  expect(changes.map(r => r.url()), 'nothing should be saved').toEqual([]);
});
