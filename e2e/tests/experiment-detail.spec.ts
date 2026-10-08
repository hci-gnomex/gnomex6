import { expect, test } from '@playwright/test';
import { browsePages, enterApp, openBrowsePage } from './browse-pages';
import { expectNoErrorDialog, openFirstMatching, visitEveryTab } from './tree-helpers';

// Read-only: opens the first experiment the user can see and looks at it; nothing is saved.

const experiments = browsePages.find(p => p.name === 'experiments')!;

test.describe('experiment detail', () => {
  test.beforeEach(async ({ page }) => {
    await enterApp(page);
    await openBrowsePage(page, experiments);
    const opened = await openFirstMatching(page, page.getByRole('tree', { name: experiments.tree }), /\/experiments\/detail\/\d+/);
    test.skip(!opened, "the user can't see any experiments");
  });

  test('shows the experiment number and its actions', async ({ page }) => {
    const detail = page.getByRole('main', { name: 'Experiment Detail Overview' });
    await expect(detail.getByRole('heading', { level: 1 })).toHaveText(/^\s*Experiment \d+R\d*\s*$/);
    const actions = detail.getByRole('toolbar', { name: 'Experiment actions' });
    await expect(actions.getByRole('button', { name: 'Download experiment files' })).toBeVisible();
    await expect(actions.getByRole('button', { name: 'Share experiment URL' })).toBeVisible();
    await expect(detail.getByRole('region', { name: 'Order Status' })).toBeVisible();
    await expectNoErrorDialog(page);
  });

  test('every tab opens and shows content', async ({ page }) => {
    const detail = page.getByRole('main', { name: 'Experiment Detail Overview' });
    const tabs = await visitEveryTab(page, detail.getByRole('region', { name: 'Experiment tabs content' }));
    // These always exist; others (Related Data, Sequence Lanes, Billing...) depend on the experiment.
    expect(tabs).toEqual(expect.arrayContaining(['Overview tab', 'Description tab', 'Experiment Design tab', 'Files tab']));
  });

  test('the experiment design tab lists its samples', async ({ page }) => {
    const detail = page.getByRole('main', { name: 'Experiment Detail Overview' });
    await detail.getByRole('tab', { name: 'Experiment Design tab' }).click();
    const panel = detail.getByRole('tabpanel', { name: 'Experiment Design tab' });
    await expect(panel.getByRole('button', { name: 'Download sample sheet' })).toBeVisible();
    await expect(panel.getByRole('grid').first().getByRole('row').nth(1)).toBeVisible();
  });
});
