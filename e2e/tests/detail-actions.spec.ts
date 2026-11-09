import { expect, Page, Request, test } from '@playwright/test';
import { browsePages, enterApp, openBrowsePage } from './browse-pages';
import { waitForSpinner, watchChanges } from './helpers';
import { expectNoErrorDialog, openFirstMatching, visitEveryTab } from './tree-helpers';

// Actions on an opened experiment, analysis and data track that other specs don't cover: the
// experiment's printable order form and "contact the core" email, linking an analysis to an
// experiment, and every data track tab. Read-only: no email is sent, nothing is linked or saved
// (any Save/Link/Email request fails the test), and each dialog is left with Cancel.

const experiments = browsePages.find(p => p.name === 'experiments')!;
const analyses = browsePages.find(p => p.name === 'analysis')!;
const dataTracks = browsePages.find(p => p.name === 'data tracks')!;

/** Records requests that would send email or link items, besides the usual Save/Delete/... ones. */
function watchSends(page: Page): Request[] {
  const sent = watchChanges(page);
  page.on('request', r => {
    if (/\/(Link\w*|\w*Email\w*|\w*Mail\w*)\.gx$/i.test(new URL(r.url()).pathname)) sent.push(r);
  });
  return sent;
}

/** Opens the first experiment the user can see; returns its id (from the URL) and number. */
async function openExperiment(page: Page): Promise<{ id: string; number: string }> {
  await enterApp(page);
  await openBrowsePage(page, experiments);
  const opened = await openFirstMatching(page, page.getByRole('tree', { name: experiments.tree }), /\/experiments\/detail\/\d+/);
  test.skip(!opened, "the user can't see any experiments");
  const heading = page.getByRole('region', { name: 'Experiment Detail Overview' }).getByRole('heading', { level: 1 });
  await expect(heading).toHaveText(/Experiment [A-Z]*\d+R\d*/);
  return {
    id: page.url().match(/\/experiments\/detail\/(\d+)/)![1],
    number: (await heading.innerText()).replace(/^\s*Experiment\s+/, '').trim(),
  };
}

test.describe('experiment actions', () => {
  test('the printable order form is a PDF of this experiment', async ({ page, context }) => {
    const { id } = await openExperiment(page);
    // The form opens in a new tab; watch every page in the context for it.
    const form = new Promise<import('@playwright/test').Response>(resolve => {
      context.on('response', r => { if (r.url().includes('ShowRequestForm.gx')) resolve(r); });
    });
    await page.getByRole('button', { name: 'Print experiment order form' }).click();
    const response = await form;
    expect(new URL(response.url()).searchParams.get('idRequest'), 'the form is for this experiment').toBe(id);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type'] || '', 'a PDF').toMatch(/pdf/i);
    const body = await response.body().catch(() => null);
    if (body) {
      expect(body.subarray(0, 5).toString('latin1'), 'a PDF file, not an error page').toBe('%PDF-');
    }
    await expectNoErrorDialog(page);
  });

  test('Contact core facility drafts an email about this experiment and sends nothing on Cancel', async ({ page }) => {
    const sent = watchSends(page);
    const { number } = await openExperiment(page);
    await page.getByRole('button', { name: 'Contact core facility via email' }).click();
    await waitForSpinner(page);
    const dialog = page.getByRole('dialog', { name: 'Email Core Regarding this Experiment' });
    const form = dialog.getByRole('form', { name: 'Email form' });
    await expect(form).toBeVisible();

    const subject = form.getByRole('textbox', { name: 'Email subject' });
    await expect(subject, 'the subject names the experiment').toHaveValue(`Inquiry about Experiment ${number}`);
    await expect(subject, 'and is fixed').toBeDisabled();
    await expect(form.getByRole('textbox', { name: 'From email address' }), "the user's email").toHaveValue(/^[^@\s]+@[^@\s]+\.[a-z]+$/i);

    const send = dialog.getByRole('button', { name: 'Send Email' });
    await expect(send, 'an email needs a body').toBeDisabled();
    const body = form.locator('[contenteditable="true"]').first();
    await body.click();
    await page.keyboard.type('e2e test: not sent');
    await expect(send, 'subject, sender and body are enough').toBeEnabled();

    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expectNoErrorDialog(page);
    expect(sent.map(r => r.url()), 'no email should be sent').toEqual([]);
  });
});

test('Link to Experiment lists the lab\'s experiments, filters them, and links nothing on Cancel', async ({ page }) => {
  test.setTimeout(3 * 60_000);
  const sent = watchSends(page);
  await enterApp(page);
  await openBrowsePage(page, analyses);
  const opened = await openFirstMatching(page, page.getByRole('tree', { name: analyses.tree }), /\/analysis\/detail\/\d+/);
  test.skip(!opened, "the user can't see any analyses");
  const idLab = new URL(page.url()).searchParams.get('idLab');

  const listed = page.waitForResponse(r => r.url().includes('GetRequestList.gx'));
  await page.getByRole('button', { name: 'Link to experiment' }).click();
  const response = await listed;
  if (idLab) {
    expect(new URL(response.url()).searchParams.get('idLab'), "the analysis's lab is listed").toBe(idLab);
  }
  await waitForSpinner(page);
  // Material's container and GNomEx's inner dialog share the name; the inner one has the content.
  const dialog = page.getByRole('dialog', { name: 'Link to Experiment', exact: true }).filter({ has: page.getByRole('search') }).last();
  const grid = dialog.getByRole('region', { name: 'Experiment selection' }).getByRole('grid');
  const rows = grid.getByRole('rowgroup').nth(1).getByRole('row');
  const link = page.getByRole('button', { name: 'Link', exact: true });
  await expect(link, 'no experiment chosen').toBeDisabled();

  // Only the analysis's own lab is listed (the dialog's lab filter narrows that list, it doesn't
  // fetch other labs), so with a lab that has no experiments the rest can't be checked.
  const hasRows = await rows.first().waitFor({ timeout: 15_000 }).then(() => true, () => false);
  if (!hasRows) {
    test.info().annotations.push({ type: 'note', description: "the analysis's lab has no experiments to link" });
  } else {
    // Filtering by the first experiment's number keeps it (and drops unrelated ones).
    const number = ((await rows.first().innerText()).match(/[A-Z]*\d+R\d*/) || [''])[0];
    const before = await rows.count();
    if (number) {
      await dialog.getByRole('textbox', { name: 'Filter by experiment number' }).fill(number);
      await expect(rows.filter({ hasText: number }).first(), `${number} is still listed`).toBeVisible();
      await expect.poll(() => rows.count(), 'the filter narrows the list').toBeLessThanOrEqual(before);
    }
    await rows.first().click();
    await expect(link, 'an experiment is chosen').toBeEnabled();
  }

  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expectNoErrorDialog(page);
  expect(sent.map(r => r.url()), 'nothing should be linked or saved').toEqual([]);
});

test('every data track tab opens and shows content', async ({ page }) => {
  // GetDataTrackList.gx can take 50-60 s for a signed-in ordinary user; see browse.spec.ts.
  test.slow();
  const sent = watchSends(page);
  await enterApp(page);
  await openBrowsePage(page, dataTracks);
  const opened = await openFirstMatching(page, page.getByRole('tree', { name: dataTracks.tree }), /\/datatracks\/detail\/\d+/);
  test.skip(!opened, "the user can't see any data tracks");
  const tabs = await visitEveryTab(page, page.locator('#main-content'));
  expect(tabs).toEqual(expect.arrayContaining(['Summary', 'Annotations', 'Files', 'Visibility']));
  await expectNoErrorDialog(page);
  expect(sent.map(r => r.url()), 'nothing should be saved').toEqual([]);
});
