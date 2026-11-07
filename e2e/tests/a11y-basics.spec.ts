import { expect, Page, test } from '@playwright/test';
import { browsePages, enterApp, openBrowsePage } from './browse-pages';
import { hasCredentials, openLoginPage, openFromNav, waitForSpinner } from './helpers';
import { openFirstMatching } from './tree-helpers';

// Basic WCAG checks on each main page: every image has alt text (1.1.1), every button and form
// field has a name (4.1.2, 1.3.1), and there is one main landmark (1.3.1 / ARIA landmarks).
// Read-only. Each problem is reported (soft) with a short description of the element, so one run
// lists everything on a page.

interface Problems { images: string[]; buttons: string[]; fields: string[]; mains: string[] }

/** Collects the visible elements that break one of the rules above. */
async function findProblems(page: Page): Promise<Problems> {
  return page.evaluate(() => {
    const visible = (el: Element) => {
      const box = (el as HTMLElement).getBoundingClientRect();
      const style = getComputedStyle(el);
      return box.width > 0 && box.height > 0 && style.visibility !== 'hidden' && !el.closest('[aria-hidden="true"]');
    };
    const describe = (el: Element) => {
      const tag = el.tagName.toLowerCase();
      const cls = (el.getAttribute('class') || '').split(/\s+/).filter(c => c && !c.startsWith('ng-')).slice(0, 2).join('.');
      const src = el.getAttribute('src');
      const where = el.closest('[aria-label]')?.getAttribute('aria-label');
      return `${tag}${cls ? '.' + cls : ''}${src ? ` src=${src.split('/').pop()}` : ''}${where ? ` in "${where}"` : ''}`;
    };
    const textOf = (ids: string | null) => (ids || '').split(/\s+/)
      .map(id => document.getElementById(id)?.textContent || '').join(' ').trim();
    const name = (el: Element): string => {
      const aria = el.getAttribute('aria-label') || textOf(el.getAttribute('aria-labelledby'));
      if (aria.trim()) return aria;
      const imgAlt = [...el.querySelectorAll('img[alt]')].map(i => i.getAttribute('alt') || '').join(' ');
      return ((el as HTMLElement).innerText || '').trim() || imgAlt.trim() || el.getAttribute('title') || '';
    };
    const fieldName = (el: Element): string => {
      const id = el.getAttribute('id');
      const label = (id && document.querySelector(`label[for="${CSS.escape(id)}"]`)?.textContent) || el.closest('label')?.textContent || '';
      return (el.getAttribute('aria-label') || textOf(el.getAttribute('aria-labelledby')) || label
        || el.getAttribute('title') || el.getAttribute('placeholder') || '').trim();
    };

    const images = [...document.querySelectorAll('img:not([alt])')]
      .filter(el => visible(el) && el.getAttribute('role') !== 'presentation').map(describe);
    const buttons = [...document.querySelectorAll('button, [role=button], a[href]')]
      .filter(el => visible(el) && !name(el)).map(describe);
    const fields = [...document.querySelectorAll('input:not([type=hidden]):not([type=button]):not([type=submit]), select, textarea')]
      .filter(el => visible(el) && !fieldName(el)).map(describe);
    // A <main>, or role=main, nested anywhere counts; ones inside an open dialog are the dialog's own.
    const mains = [...document.querySelectorAll('main, [role=main]')]
      .filter(el => visible(el) && !el.closest('[role=dialog], mat-dialog-container'))
      .map(el => `${el.tagName.toLowerCase()}${el.getAttribute('aria-label') ? ` "${el.getAttribute('aria-label')}"` : ''}`);
    return { images, buttons, fields, mains };
  });
}

/** Reports a page's problems as soft failures, one per rule, listing distinct elements. */
async function checkPage(page: Page, where: string): Promise<void> {
  await waitForSpinner(page);
  const p = await findProblems(page);
  const uniq = (list: string[]) => [...new Set(list)];
  expect.soft(uniq(p.images), `${where}: images without alt text`).toEqual([]);
  expect.soft(uniq(p.buttons), `${where}: buttons and links without a name`).toEqual([]);
  expect.soft(uniq(p.fields), `${where}: form fields without a label`).toEqual([]);
  expect.soft(p.mains.length, `${where}: main landmarks (${p.mains.join(', ')})`).toBe(1);
}

test('the sign-in page', async ({ page }) => {
  await openLoginPage(page);
  await checkPage(page, 'Sign in');
});

test('Home', async ({ page }) => {
  await enterApp(page);
  await checkPage(page, 'Home');
});

const experiments = browsePages.find(p => p.name === 'experiments')!;
const analysis = browsePages.find(p => p.name === 'analysis')!;

test('Experiments, list and detail', async ({ page }) => {
  await enterApp(page);
  await openBrowsePage(page, experiments);
  await checkPage(page, 'Experiments list');
  const opened = await openFirstMatching(page, page.getByRole('tree', { name: experiments.tree }), /\/experiments\/detail\/\d+/);
  if (opened) {
    await checkPage(page, 'Experiment detail');
  }
});

test('Analysis, list and detail', async ({ page }) => {
  await enterApp(page);
  await openBrowsePage(page, analysis);
  await checkPage(page, 'Analysis list');
  const opened = await openFirstMatching(page, page.getByRole('tree', { name: analysis.tree }), /\/analysis\/detail\/\d+/);
  if (opened) {
    await checkPage(page, 'Analysis detail');
  }
});

test('Topics', async ({ page }) => {
  await enterApp(page);
  const topics = page.locator('#main-nav').getByRole('button', { name: 'Topics', exact: true });
  test.skip(!(await topics.isVisible()), '"Topics" isn\'t in this user\'s main menu');
  await openFromNav(page, 'Topics');
  await expect(page.getByRole('tree', { name: 'Topics' }).getByRole('treeitem').first()).toBeVisible();
  await checkPage(page, 'Topics');
});

test('My Account', async ({ page }) => {
  test.skip(!hasCredentials, 'My Account needs a signed-in user');
  await enterApp(page);
  await page.getByRole('button', { name: 'Account menu' }).click();
  await page.getByRole('menuitem', { name: 'My Account' }).click();
  await expect(page.getByRole('region', { name: 'My Account' })).toBeVisible();
  await checkPage(page, 'My Account');
});

// One page per kind of Reports page; opened from the menu, not run.
for (const report of ['Project/Experiment Report', 'Annotation Report', 'Annotation Progress Report']) {
  test(`Reports › ${report}`, async ({ page }) => {
    await enterApp(page);
    const reports = page.locator('#main-nav').getByRole('button', { name: /^Reports( \.\.\.)? menu$/ });
    test.skip(!(await reports.isVisible()), 'this user has no Reports menu');
    await reports.click();
    const entry = page.getByRole('menuitem', { name: report, exact: true });
    test.skip(!(await entry.isVisible()), `no "${report}" in this user's Reports menu`);
    await entry.click();
    await waitForSpinner(page);
    await checkPage(page, report);
  });
}
