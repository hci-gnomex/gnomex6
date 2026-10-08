import { expect, test } from '@playwright/test';
import { browsePages, enterApp, openBrowsePage } from './browse-pages';
import { expectNoErrorDialog, openFirstMatching, visitEveryTab } from './tree-helpers';

// Read-only: opens the first analysis the user can see and looks at it; nothing is saved.

const analysis = browsePages.find(p => p.name === 'analysis')!;

test.describe('analysis detail', () => {
  let opened: string | null;

  test.beforeEach(async ({ page }) => {
    await enterApp(page);
    await openBrowsePage(page, analysis);
    opened = await openFirstMatching(page, page.getByRole('tree', { name: analysis.tree }), /\/analysis\/detail\/\d+/);
    test.skip(!opened, "the user can't see any analyses");
  });

  test('shows the analysis number and its details', async ({ page }) => {
    const detail = page.getByRole('main', { name: 'Analysis detail overview' });
    const actions = detail.getByRole('toolbar', { name: 'Analysis actions' });
    // Tree labels look like "A1285 (name)"; the toolbar shows "Analysis A1285".
    const number = opened!.match(/^A\d+/)![0];
    await expect(actions).toContainText(`Analysis ${number}`);
    await expect(actions.getByRole('button', { name: 'Share URL' })).toBeVisible();
    const form = detail.getByRole('form', { name: 'Analysis information form' });
    await expect(form.getByRole('textbox', { name: 'Analysis name' })).not.toHaveValue('');
    await expect(form.getByRole('radiogroup', { name: 'Select visibility level' })).toBeVisible();
    await expectNoErrorDialog(page);
  });

  test('every tab opens and shows content', async ({ page }) => {
    const detail = page.getByRole('main', { name: 'Analysis detail overview' });
    const tabs = await visitEveryTab(page, detail.getByRole('region', { name: 'Analysis details' }));
    expect(tabs).toEqual(expect.arrayContaining([
      'Analysis information tab', 'Analysis description tab', 'Analysis annotations tab', 'Analysis files tab']));
  });
});
