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
    // Numbers may carry a letter prefix, e.g. "S1261R".
    await expect(detail.getByRole('heading', { level: 1 })).toHaveText(/^\s*Experiment [A-Z]*\d+R\d*\s*$/);
    const actions = detail.getByRole('toolbar', { name: 'Experiment actions' });
    await expect(actions.getByRole('button', { name: 'Download experiment files' })).toBeVisible();
    await expect(actions.getByRole('button', { name: 'Share experiment URL' })).toBeVisible();
    // Order Status only exists for some experiment types (not e.g. "S" numbers), so check the tab.
    await expect(detail.getByRole('tabpanel', { name: 'Overview tab' })).not.toBeEmpty();
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

  test('Share URL gives a link to this experiment and copies it', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const detail = page.getByRole('main', { name: 'Experiment Detail Overview' });
    const number = (await detail.getByRole('heading', { level: 1 }).innerText()).replace('Experiment', '').trim();

    await detail.getByRole('toolbar', { name: 'Experiment actions' }).getByRole('button', { name: 'Share experiment URL' }).click();
    const dialog = page.getByRole('dialog', { name: `Web Link for Experiment ${number}` }).first();
    const link = dialog.getByRole('textbox', { name: 'Shareable link URL' });
    await expect(link).toHaveValue(new RegExp(`/gnomex/\\?requestNumber=${number}$`));

    await dialog.getByRole('button', { name: 'Copy To Clipboard' }).click();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toBe(await link.inputValue());

    await dialog.getByRole('button', { name: 'Close dialog' }).click();
    await expect(dialog).toBeHidden();
  });
});
