import { BrowserContext, expect, Page, Response, test } from '@playwright/test';
import { enterApp, LAB } from './browse-pages';
import { waitForSpinner } from './helpers';
import { expectNoErrorDialog } from './tree-helpers';
import { WRITE_LAB } from './write-helpers';

// Reports › Project/Experiment Report, Annotation Report and Annotation Progress Report. Running
// them only reads data: each report opens in a new tab as a spreadsheet, which Playwright keeps in
// its own temporary folder and deletes.

/**
 * Opens a Reports menu item, or skips if this user has no Reports menu or no such item. Returns
 * whether the user is an admin (may see every lab), read from the session's security advisor.
 */
async function openReport(page: Page, item: string): Promise<{ admin: boolean }> {
  const advisor = page.waitForResponse(r => r.url().includes('CreateSecurityAdvisor.gx'), { timeout: 150_000 })
    .then(r => r.text(), () => '');
  await enterApp(page);
  const admin = (await advisor).includes('canAccessAnyObject');
  const reports = page.locator('#main-nav').getByRole('button', { name: /^Reports( \.\.\.)? menu$/ });
  test.skip(!(await reports.isVisible()), 'this user has no Reports menu');
  await reports.click();
  const entry = page.getByRole('menuitem', { name: item, exact: true });
  test.skip(!(await entry.isVisible()), `this user's Reports menu has no "${item}"`);
  await entry.click();
  await waitForSpinner(page);
  await expect(page.getByRole('heading', { name: item })).toBeVisible();
  return { admin };
}

/**
 * Presses Run and returns the report's response. The report opens in a new tab, so every page in
 * the context is watched for it.
 */
async function runReport(page: Page, context: BrowserContext, endpoint: string): Promise<Response> {
  const report = new Promise<Response>(resolve => {
    context.on('response', r => { if (r.url().includes(endpoint)) resolve(r); });
  });
  const popup = context.waitForEvent('page');
  await page.getByRole('button', { name: 'Run', exact: true }).click();
  await popup;
  return report;
}

/** Checks a report came back as a file, not GNomEx's error message or an empty page. */
async function expectSpreadsheet(response: Response): Promise<void> {
  expect(response.status(), 'the report should be served').toBe(200);
  const headers = response.headers();
  // Seen 2026-11: an empty 200 when the report's JSP doesn't compile (Tomcat's logs/localhost.*.log
  // has the JasperException), so the user just gets a blank tab. The Annotation Report and Annotation
  // Progress Report JSPs used the pre-4.0 POI API (BORDER_THIN, ALIGN_LEFT, BOLDWEIGHT_BOLD...);
  // fixed by porting report_xls_upgraded.jsp and report_xls_annot_progress.jsp to POI 5.
  expect(headers['content-length'], "the report should not be empty (check Tomcat's localhost log for a JSP error)").not.toBe('0');
  // A report that downloads has no body to read here; one shown in the tab (an error) does.
  const body = await response.body().catch(() => null);
  if (body) {
    const error = body.subarray(0, 300).toString('latin1').match(/"result"\s*:\s*"(?:ERROR|INVALID)"[^}]*?"message"\s*:\s*"([^"]*)"/);
    expect(error ? error[1] : null, 'the server should not refuse the report').toBeNull();
  }
  const type = headers['content-type'] || '';
  const disposition = headers['content-disposition'] || '';
  expect(`${type} ${disposition}`, 'an Excel or CSV file').toMatch(/excel|spreadsheet|csv|\.xlsx?|\.csv/i);
}

/**
 * Chooses the labs to report on. Ordinary users leave "All Labs...", which the server limits to
 * their own labs (picking another lab is refused: "Insufficient permissions to access experiments
 * for lab N"). Admins would get every lab, so they pick GNOMEX_LAB (else GNOMEX_WRITE_LAB, else the
 * first lab). Returns what was chosen.
 */
async function chooseLabs(page: Page, admin: boolean): Promise<string> {
  if (!admin) {
    return "the user's own labs";
  }
  await page.getByRole('combobox', { name: 'All Labs...' }).click();
  const listed = page.getByRole('option').filter({ hasNotText: /^\s*(None|All Labs\.\.\.)\s*$/ });
  await expect(listed.first(), 'labs are listed').toBeVisible();
  let option = listed.first();
  for (const wanted of [LAB, WRITE_LAB].filter(Boolean)) {
    const match = page.getByRole('option', { name: wanted, exact: true });
    if (await match.count()) {
      option = match.first();
      break;
    }
  }
  const name = (await option.innerText()).trim();
  await option.click();
  await waitForSpinner(page);
  return name;
}

test('the Project/Experiment Report runs and returns a spreadsheet', async ({ page, context }) => {
  await openReport(page, 'Project/Experiment Report');
  await expectSpreadsheet(await runReport(page, context, 'ShowProjectExperimentReport.gx'));
  await expectNoErrorDialog(page);
});

test('the Annotation Progress Report runs and returns a spreadsheet', async ({ page, context }) => {
  const { admin } = await openReport(page, 'Annotation Progress Report');
  await expect(page).toHaveTitle('Annotation Progress Report — GNomEx');
  const labs = await chooseLabs(page, admin);

  const response = await runReport(page, context, 'ShowAnnotationProgressReport.gx');
  expect(new URL(response.url()).searchParams.get('idLab'), `the report is for ${labs}`).toMatch(admin ? /^\d+$/ : /^$/);
  await expectSpreadsheet(response);
  await expectNoErrorDialog(page);
});

test('the Annotation Report runs with the chosen annotations and columns', async ({ page, context }) => {
  const { admin } = await openReport(page, 'Annotation Report');
  await expect(page).toHaveTitle('Annotation Report — GNomEx');
  await expect(page.getByRole('radio', { name: 'Experiment Samples' }), 'sample annotations by default').toBeChecked();
  const labs = await chooseLabs(page, admin);

  // The grids aren't named, so find each by its column; their first rowgroup holds the header.
  const annotations = page.getByRole('grid').filter({ has: page.getByRole('columnheader', { name: 'Annotation', exact: true }) });
  const columns = page.getByRole('grid').filter({ has: page.getByRole('columnheader', { name: 'Custom Columns', exact: true }) });
  const firstAnnotation = annotations.getByRole('rowgroup').nth(1).getByRole('row').first();
  const annotationListed = await firstAnnotation.waitFor({ timeout: 15_000 }).then(() => true, () => false);
  if (annotationListed) {
    await firstAnnotation.click();
  } else {
    test.info().annotations.push({ type: 'note', description: `no sample annotations listed for ${labs}` });
  }
  await columns.getByRole('row', { name: /Create Date/ }).click();

  const response = await runReport(page, context, 'ShowAnnotationReport.gx');
  const params = new URL(response.url()).searchParams;
  expect(params.get('idLab'), `the report is for ${labs}`).toMatch(admin ? /^\d+$/ : /^$/);
  expect(params.get('target'), 'for experiment samples').toBe('SAMPLE');
  expect(params.get('customColumnString'), 'the chosen column is sent').toMatch(/^\d+$/);
  if (annotationListed) {
    expect(params.get('idProperties'), 'the chosen annotation is sent').toMatch(/^\d+$/);
  }
  await expectSpreadsheet(response);
  await expectNoErrorDialog(page);
});
