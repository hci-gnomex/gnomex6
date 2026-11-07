import { expect, Locator, Page, Request, test } from '@playwright/test';
import { browsePages, enterApp, openBrowsePage } from './browse-pages';
import { waitForSpinner } from './helpers';
import { expectNoErrorDialog, openFirstMatching } from './tree-helpers';

// Edit mode on an analysis: fields unlock in Edit and lock again in View, and leaving with unsaved
// changes asks first. Nothing is saved: names are changed only in the browser and discarded, and
// any Save*.gx request fails the test.

const analysis = browsePages.find(p => p.name === 'analysis')!;

/** Records calls to server Save commands. */
function watchSaves(page: Page): Request[] {
  const saves: Request[] = [];
  page.on('request', r => { if (/\/Save\w*\.gx/i.test(new URL(r.url()).pathname)) saves.push(r); });
  return saves;
}

interface Editable { overview: Locator; edit: Locator; view: Locator; name: Locator; original: string }

/** Opens the first analysis; skips unless this user may edit it. */
async function openEditableAnalysis(page: Page): Promise<Editable> {
  await enterApp(page);
  await openBrowsePage(page, analysis);
  const opened = await openFirstMatching(page, page.getByRole('tree', { name: analysis.tree }), /\/analysis\/detail\/\d+/);
  test.skip(!opened, "the user can't see any analyses");
  const overview = page.getByRole('region', { name: 'Analysis detail overview' });
  const actions = overview.getByRole('toolbar', { name: 'Analysis actions' });
  const edit = actions.getByRole('button', { name: 'Switch to edit mode' });
  test.skip(!(await edit.isVisible()), 'this user may not edit the analysis');
  const name = overview.getByRole('textbox', { name: 'Analysis name' });
  await expect(name).not.toHaveValue('');
  return {
    overview, edit, name,
    view: actions.getByRole('button', { name: 'Switch to view mode' }),
    original: await name.inputValue(),
  };
}

/** The "Your changes haven't been saved. Continue anyway?" question. */
function unsavedQuestion(page: Page): Locator {
  return page.getByRole('alertdialog').filter({ hasText: "Your changes haven't been saved" });
}

test('Edit unlocks the analysis fields and View locks them again', async ({ page }) => {
  const saves = watchSaves(page);
  const a = await openEditableAnalysis(page);
  await expect(a.name, 'read-only in view mode').not.toBeEditable();

  await a.edit.click();
  await expect(a.view).toBeVisible();
  await expect(a.name, 'editable in edit mode').toBeEditable();

  // No changes, so switching back needs no confirmation.
  await a.view.click();
  await expect(unsavedQuestion(page)).toHaveCount(0);
  await expect(a.edit).toBeVisible();
  await expect(a.name).not.toBeEditable();
  await expectNoErrorDialog(page);
  expect(saves.map(r => r.url())).toEqual([]);
});

test('leaving edit mode with unsaved changes asks first, and No keeps editing', async ({ page }) => {
  const saves = watchSaves(page);
  const a = await openEditableAnalysis(page);
  await a.edit.click();
  await a.name.fill(`e2e-unsaved-${Date.now()}`);
  const edited = await a.name.inputValue();

  await a.view.click();
  const question = unsavedQuestion(page);
  await expect(question).toBeVisible();
  await question.getByRole('button', { name: 'No', exact: true }).click();
  await expect(question).toBeHidden();
  await expect(a.view, 'still in edit mode').toBeVisible();
  await expect(a.name, 'the edit is kept').toHaveValue(edited);

  // Put the name back and leave without saving.
  await a.name.fill(a.original);
  await a.view.click();
  if (await question.isVisible().catch(() => false)) {
    await question.getByRole('button', { name: 'Yes', exact: true }).click();
  }
  await expect(a.edit).toBeVisible();
  expect(saves.map(r => r.url()), 'nothing should be saved').toEqual([]);
});

test('discarding unsaved changes shows the saved values again', async ({ page }) => {
  const saves = watchSaves(page);
  const a = await openEditableAnalysis(page);
  await a.edit.click();
  await a.name.fill(`e2e-unsaved-${Date.now()}`);

  await a.view.click();
  const question = unsavedQuestion(page);
  await question.getByRole('button', { name: 'Yes', exact: true }).click();
  await expect(question).toBeHidden();
  await expect(a.edit, 'back in view mode').toBeVisible();
  await waitForSpinner(page);

  // Seen 2026-11: switching back only marked the form clean, so the discarded name stayed on screen
  // as if it had been saved. Fixed: AnalysisDetailOverviewComponent reloads the saved analysis.
  await expect(a.name, 'the discarded name should not still be shown').toHaveValue(a.original);
  expect(saves.map(r => r.url()), 'nothing should be saved').toEqual([]);

  // And the server still has the original.
  await page.reload();
  await expect(a.name).toHaveValue(a.original, { timeout: 60_000 });
});
