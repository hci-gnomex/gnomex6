import { expect, Locator, Page, test } from '@playwright/test';
import { enterApp } from './browse-pages';
import { openMenuItem, pickRadio, waitForSpinner, watchChanges } from './helpers';
import { expectNoErrorDialog } from './tree-helpers';

// Configure › Configure Organisms and Genome Builds, and Configure › Configure Annotations.
// Read-only: rows are selected and fields edited only to see the form react; Save, Add and Remove
// are never pressed, and any Save/Delete request fails the test.

/** The rows of an ag-grid's body (its first rowgroup holds the header row). */
function bodyRows(grid: Locator): Locator {
  return grid.getByRole('rowgroup').nth(1).getByRole('row');
}

// ---- Organisms ----------------------------------------------------------------------------------

/** Opens Configure Organisms and waits for the organism list. */
async function openOrganisms(page: Page): Promise<{ main: Locator; organisms: Locator }> {
  await enterApp(page);
  const listed = page.waitForResponse(r => r.url().includes('GetOrganismList.gx'), { timeout: 120_000 });
  await openMenuItem(page, 'Configure', 'Configure Organisms and Genome Builds');
  await listed;
  await waitForSpinner(page);
  const main = page.locator('#main-content');
  await expect(main.getByRole('heading', { name: 'Configure Organisms' })).toBeVisible();
  // The grids aren't named (the aria-label sits on <ag-grid-angular>, which has no role), so find
  // the organism list by its column.
  const organisms = main.getByRole('grid').filter({ has: page.getByRole('columnheader', { name: 'Organism', exact: true }) });
  await expect(bodyRows(organisms).first(), 'the organism list loads').toBeVisible();
  return { main, organisms };
}

/** Clicks an organism row (skipping the generic "Other") and returns its name. */
async function selectOrganism(organisms: Locator): Promise<string> {
  const rows = bodyRows(organisms).filter({ hasNotText: /^\s*Other\s*$/ });
  const row = (await rows.count()) ? rows.first() : bodyRows(organisms).first();
  const name = (await row.innerText()).trim();
  await row.click();
  return name;
}

test('the organism list loads and selecting one shows its details and genome builds', async ({ page }) => {
  const changes = watchChanges(page);
  const { main, organisms } = await openOrganisms(page);
  await expect(page).toHaveTitle('Configure Organisms and Genome Builds — GNomEx');
  await expect(main.getByRole('textbox', { name: 'Name', exact: true }), 'no details before a selection').toHaveCount(0);
  await expect(main.getByRole('button', { name: 'Remove', exact: true }).first(), 'nothing selected to remove').toBeDisabled();

  const name = await selectOrganism(organisms);
  await expect(main.getByRole('textbox', { name: 'Name', exact: true }), 'the details are the chosen organism\'s').toHaveValue(name);
  await expect(main.getByRole('checkbox', { name: 'Active' })).toBeVisible();
  await expect(main.getByRole('textbox', { name: 'Binomial Name' })).toBeVisible();
  const builds = main.getByRole('grid').filter({ has: page.getByRole('columnheader', { name: 'Build Date' }) });
  await expect(builds, 'the genome build list').toBeVisible();
  for (const column of ['Name', 'Das2Name', 'Latest Build', 'Active']) {
    await expect(builds.getByRole('columnheader', { name: column, exact: true })).toBeVisible();
  }
  await expectNoErrorDialog(page);
  expect(changes.map(r => r.url()), 'nothing should be saved').toEqual([]);
});

test('an organism\'s Sort Order must be a number, and an invalid form can\'t be saved', async ({ page }) => {
  const changes = watchChanges(page);
  const { main, organisms } = await openOrganisms(page);
  await selectOrganism(organisms);
  const sortOrder = main.getByRole('textbox', { name: 'Sort Order' });
  await expect(sortOrder).toBeVisible();
  const save = main.getByRole('button', { name: 'Save', exact: true });

  await sortOrder.fill('abc');
  await sortOrder.blur();
  await expect(main.getByText('Must be a number less than or equal to 99999'), 'letters are rejected').toBeVisible();
  await expect(save, 'an invalid organism can\'t be saved').toBeDisabled();
  await expect(main.getByText('Changes Have Not Been Saved'), 'the edit is flagged as unsaved').toBeVisible();

  await sortOrder.fill('123456');
  await sortOrder.blur();
  await expect(main.getByText('Must be a number less than or equal to 99999'), 'six digits are too many').toBeVisible();

  await sortOrder.fill('42');
  await sortOrder.blur();
  await expect(main.getByText('Must be a number less than or equal to 99999'), 'a number is accepted').toHaveCount(0);
  await expectNoErrorDialog(page);
  expect(changes.map(r => r.url()), 'nothing should be saved').toEqual([]);
});

// ---- Annotations --------------------------------------------------------------------------------

/**
 * Opens Configure Annotations and waits for the annotation list. GetPropertyList.gx is slow (seen
 * 2026-11: over a minute on a cold server), so the calling test gets extra time.
 */
async function openAnnotations(page: Page): Promise<{ main: Locator; annotations: Locator }> {
  test.setTimeout(Math.max(test.info().timeout, 4 * 60_000));
  await enterApp(page);
  const started = Date.now();
  const listed = page.waitForResponse(r => r.url().includes('GetPropertyList.gx'), { timeout: 150_000 });
  await openMenuItem(page, 'Configure', 'Configure Annotations');
  await listed;
  test.info().annotations.push({ type: 'timing', description: `GetPropertyList.gx took ${((Date.now() - started) / 1000).toFixed(1)} s` });
  await waitForSpinner(page);
  const main = page.locator('#main-content');
  await expect(main.getByRole('radiogroup', { name: 'Show Annotations For' })).toBeVisible();
  const annotations = main.getByRole('grid').filter({ has: page.getByRole('columnheader', { name: 'Annotation', exact: true }) });
  await expect(bodyRows(annotations).first(), 'the annotation list loads').toBeVisible();
  return { main, annotations };
}

/**
 * Clicks an annotation row and waits for its details (GetProperty.gx). Returns the row's name
 * without the "*" GNomEx puts before annotations limited to some organisms, platforms or users.
 */
async function selectAnnotation(page: Page, row: Locator): Promise<string> {
  const name = (await row.innerText()).trim().replace(/^\*/, '');
  const loaded = page.waitForResponse(r => r.url().includes('GetProperty.gx'));
  await row.click();
  const response = await loaded;
  expect(new URL(response.url()).searchParams.get('idProperty'), 'the chosen annotation is requested').toMatch(/^\d+$/);
  await waitForSpinner(page);
  await expect(page.getByRole('textbox', { name: 'Annotation name' })).toHaveValue(name);
  return name;
}

test('selecting an annotation shows its settings on each tab', async ({ page }) => {
  const changes = watchChanges(page);
  const { main, annotations } = await openAnnotations(page);
  await expect(page).toHaveTitle('Configure Annotations — GNomEx');
  await expect(main.getByRole('button', { name: 'Remove selected annotation' }), 'nothing selected to remove').toBeDisabled();

  await selectAnnotation(page, bodyRows(annotations).first());
  const type = main.getByRole('radiogroup').filter({ has: page.getByRole('radio', { name: 'Checkbox', exact: true }) });
  await expect(type.getByRole('radio', { checked: true }), 'the annotation has one type').toHaveCount(1);
  await expect(main.getByRole('button', { name: 'Save', exact: true }), 'nothing changed yet').toBeDisabled();

  for (const tab of ['Applies To', 'Mage Ontology', 'Annotation']) {
    await main.getByRole('tab', { name: tab, exact: true }).click();
    await expect(main.getByRole('tab', { name: tab, exact: true })).toHaveAttribute('aria-selected', 'true');
    await expect(main.getByRole('tabpanel', { name: tab, exact: true })).toBeVisible();
  }
  await expect(main.getByRole('grid', { name: 'Platforms list' }).or(main.getByText('Only show for these organisms')).first(),
    'Applies To lists where the annotation is used').toBeAttached();
  await expectNoErrorDialog(page);
  expect(changes.map(r => r.url()), 'nothing should be saved').toEqual([]);
});

// "Show Annotations For" filters the list in the browser; each choice should only list annotations
// that annotate that kind of object (checked in the first one listed).
const SHOW_FOR: [string, string][] = [
  ['Samples', 'Annotates samples'],
  ['Analysis', 'Annotates analyses'],
  ['Data Tracks', 'Annotates data tracks'],
  ['Experiments', 'Annotates experiments'],
];

test('"Show Annotations For" lists only annotations for that kind of object', async ({ page }) => {
  test.setTimeout(6 * 60_000);
  const changes = watchChanges(page);
  const { main, annotations } = await openAnnotations(page);
  const showFor = main.getByRole('radiogroup', { name: 'Show Annotations For' });

  for (const [choice, checkbox] of SHOW_FOR) {
    await test.step(choice, async () => {
      await pickRadio(showFor.getByRole('radio', { name: choice, exact: true }));
      // Changing the filter clears the selection, so the details close.
      await expect(main.getByRole('textbox', { name: 'Annotation name' })).toHaveCount(0);
      const first = bodyRows(annotations).first();
      if (!(await first.isVisible().catch(() => false))) {
        test.info().annotations.push({ type: 'note', description: `no annotations for ${choice}` });
        return;
      }
      const name = await selectAnnotation(page, first);
      await expect(main.getByRole('checkbox', { name: checkbox }), `"${name}" is listed under ${choice}`).toBeChecked();
    });
  }
  await pickRadio(showFor.getByRole('radio', { name: 'All', exact: true }));
  await expect(bodyRows(annotations).first()).toBeVisible();
  await expectNoErrorDialog(page);
  expect(changes.map(r => r.url()), 'nothing should be saved').toEqual([]);
});

test('an annotation needs a name before it can be saved', async ({ page }) => {
  const changes = watchChanges(page);
  const { main, annotations } = await openAnnotations(page);
  const original = await selectAnnotation(page, bodyRows(annotations).first());
  const name = main.getByRole('textbox', { name: 'Annotation name' });
  const save = main.getByRole('button', { name: 'Save', exact: true });

  await name.fill('');
  await name.blur();
  await expect(main.getByRole('alert').filter({ hasText: 'Required' }), 'the empty name is flagged').toBeVisible();
  await expect(save, 'an unnamed annotation can\'t be saved').toBeDisabled();

  await name.fill(original);
  await name.blur();
  await expect(main.getByRole('alert').filter({ hasText: 'Required' })).toHaveCount(0);
  await expectNoErrorDialog(page);
  expect(changes.map(r => r.url()), 'nothing should be saved').toEqual([]);
});
