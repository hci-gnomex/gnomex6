import { expect, Page, Request, test } from '@playwright/test';
import * as fs from 'fs';
import { browsePages, enterApp, openBrowsePage } from './browse-pages';
import { waitForSpinner } from './helpers';
import { expectNoErrorDialog, openFirstMatching } from './tree-helpers';

// Downloads from an experiment. The Download Files dialog is filled and emptied again but never
// downloads; the sample sheet is downloaded into Playwright's own temporary folder, which it deletes.

const experiments = browsePages.find(p => p.name === 'experiments')!;

/** Opens the first experiment in the tree. */
async function openFirstExperiment(page: Page): Promise<void> {
  await enterApp(page);
  await openBrowsePage(page, experiments);
  const opened = await openFirstMatching(page, page.getByRole('tree', { name: experiments.tree }), /\/experiments\/detail\/\d+/);
  test.skip(!opened, "the user can't see any experiments");
}

/** Records requests that would fetch or link files, so a test can check none were sent. */
function watchFileRequests(page: Page): Request[] {
  const requests: Request[] = [];
  page.on('request', r => { if (/DownloadFileServlet|FDT|SoftLink/i.test(r.url())) requests.push(r); });
  return requests;
}

test('Download Files builds a download list without downloading', async ({ page }) => {
  await openFirstExperiment(page);
  const fileRequests = watchFileRequests(page);
  const detail = page.getByRole('region', { name: 'Experiment Detail Overview' });
  await detail.getByRole('button', { name: 'Download experiment files' }).click();
  await waitForSpinner(page);

  const dialog = page.getByRole('dialog', { name: 'Download Files' }).first();
  const available = dialog.getByRole('tree', { name: 'Available files tree' });
  const toDownload = dialog.getByRole('tree', { name: 'Files to download tree' });
  const download = dialog.getByRole('button', { name: 'Download selected files' });
  const chosen = dialog.getByLabel('Files to download count and size');
  await expect(available).toBeVisible();
  await expect(download, 'nothing chosen yet').toBeDisabled();
  await expect(chosen).toContainText(/^\s*0 file\(s\)/);

  // Seen 2026-11: on the dev server no experiment has files on disk (only empty QC folders), so
  // only the empty state can be checked there; the add/remove steps run wherever files exist.
  const hasFiles = !/^\s*0 file\(s\)/.test(await dialog.getByLabel('Available files count').innerText());
  if (hasFiles) {
    // The first row is the experiment itself; adding it adds all of its files.
    const add = available.getByRole('button', { name: /^Add .+ to download list$/ }).first();
    const what = (await add.getAttribute('aria-label'))!.replace(/^Add | to download list$/g, '');
    // The per-row actions only show on hover/focus; use them the way a keyboard user would.
    await add.focus();
    await add.press('Enter');
    await expect(chosen, 'the chosen files are counted').not.toContainText(/^\s*0 file\(s\)/);
    await expect(download).toBeEnabled();

    // Take it back out again: the list and the button return to their empty state.
    const remove = toDownload.getByRole('button', { name: `Remove ${what} from download list` }).first();
    await remove.focus();
    await remove.press('Enter');
    await expect(chosen).toContainText(/^\s*0 file\(s\)/);
    await expect(download).toBeDisabled();
  } else {
    test.info().annotations.push({ type: 'note', description: 'the experiment has no files; only the empty state was checked' });
  }

  await dialog.getByRole('button', { name: 'Cancel download' }).click();
  await expect(dialog).toBeHidden();
  await expectNoErrorDialog(page);
  expect(fileRequests.map(r => r.url()), 'no file should be fetched or linked').toEqual([]);
});

test('the sample sheet downloads as a file with the samples in it', async ({ page }) => {
  await openFirstExperiment(page);
  const detail = page.getByRole('region', { name: 'Experiment Detail Overview' });
  const number = (await detail.getByRole('heading', { level: 1 }).innerText()).replace('Experiment', '').trim();
  await detail.getByRole('tab', { name: 'Experiment Design tab' }).click();
  const panel = detail.getByRole('tabpanel', { name: 'Experiment Design tab' });
  const rows = panel.getByRole('grid').first().getByRole('row');
  await expect(rows.nth(1)).toBeVisible();

  const downloaded = page.waitForEvent('download');
  await panel.getByRole('button', { name: 'Download sample sheet' }).click();
  const file = await downloaded;
  expect(await file.failure(), 'the download should complete').toBeNull();
  expect(file.suggestedFilename(), 'a spreadsheet or text file').toMatch(/\.(xlsx?|txt|tsv|csv)$/i);

  const path = await file.path();
  const size = fs.statSync(path).size;
  expect(size, 'the file should not be empty').toBeGreaterThan(100);
  // Text exports should name the experiment's samples (Excel files are binary, so only checked for size).
  if (/\.(txt|tsv|csv)$/i.test(file.suggestedFilename())) {
    const text = fs.readFileSync(path, 'utf8');
    expect(text.split(/\r?\n/).filter(l => l.trim()).length, 'a header plus at least one sample').toBeGreaterThan(1);
    expect(text).toContain(number.replace(/R\d*$/, ''));
  }
  await expectNoErrorDialog(page);
});
