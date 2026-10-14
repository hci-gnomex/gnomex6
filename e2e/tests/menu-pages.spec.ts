import { expect, Page, test } from '@playwright/test';
import { enterApp } from './browse-pages';
import { waitForAppReady, waitForSpinner } from './helpers';

// Opens every item in the main navigation's drop-down menus and checks each page or dialog loads
// without an error. The menus depend on the user's role (guests have none, admins many), so the
// items are discovered at run time and each one is its own step. Read-only: dialogs are closed with
// Cancel/Close, and items that could act straight away are skipped.

const SKIP_ITEMS = /sign ?out|log ?out|\bsend\b|e-?mail|refresh|re-?index|delete|remove|\brun\b/i;

interface MenuItem { menu: string; parent?: string; item: string }

/** Closes Material menus/overlays left open (their backdrop blocks clicks on the page). */
async function dismissOverlays(page: Page): Promise<void> {
  for (let i = 0; i < 5 && await page.locator('.cdk-overlay-backdrop').count(); i++) {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    // Escape usually removes the backdrop already, and a click waits for its target to exist, so
    // keep this short or it waits for the whole test.
    const backdrop = page.locator('.cdk-overlay-backdrop').last();
    if (await backdrop.count()) {
      await backdrop.click({ force: true, position: { x: 2, y: 2 }, timeout: 1_000 }).catch(() => {});
    }
  }
}

/** Closes dialogs with their own Cancel/Close/No/Ok buttons, never Save, Submit or Send. */
async function closeDialogs(page: Page): Promise<void> {
  for (let i = 0; i < 4 && await page.getByRole('dialog').count(); i++) {
    const close = page.getByRole('button', { name: /^(Cancel|Close dialog|Close|No|Ok|OK)$/ });
    if (await close.count()) {
      await close.last().click({ timeout: 5_000 }).catch(() => page.keyboard.press('Escape'));
    } else {
      await page.keyboard.press('Escape');
    }
    await page.waitForTimeout(500);
  }
  await dismissOverlays(page);
}

/** The main navigation's drop-down menus, e.g. "Reports menu" (labels vary by role: "Products menu"/"Products... menu"). */
async function menuNames(page: Page): Promise<string[]> {
  return (await page.locator('#main-nav').getByRole('button').evaluateAll(els => els.map(e => e.getAttribute('aria-label') || '')))
    .filter(name => / menu$/.test(name));
}

/**
 * Returns to Home through the logo. Some pages leave an invisible layer over the header (seen on
 * Products › Product Ledger), so if the click is blocked, reload Home instead; a signed-in session
 * survives a reload (guests have no menus, so they never get here).
 */
async function backHome(page: Page): Promise<void> {
  const clicked = await page.getByRole('link', { name: 'GNomEx home' }).click({ timeout: 10_000 }).then(() => true, () => false);
  if (!clicked) {
    test.info().annotations.push({ type: 'note', description: `the Home link was covered on ${page.url()}; reloaded Home instead` });
    await page.goto('home');
    await waitForAppReady(page);
  }
  await waitForSpinner(page).catch(() => {});
}

/** Lists the given menus' items, expanding submenus one level. */
async function discoverMenuItems(page: Page, menus: string[]): Promise<MenuItem[]> {
  const nav = page.locator('#main-nav');
  const found: MenuItem[] = [];
  for (const menu of menus) {
    await nav.getByRole('button', { name: menu, exact: true }).click();
    const list = page.getByRole('menu').last();
    await expect(list.getByRole('menuitem').first()).toBeVisible();
    const items = await list.getByRole('menuitem').evaluateAll(els => els.map(e => e.getAttribute('aria-label') || (e.textContent || '').trim()));
    for (const item of items) {
      if (!/ submenu$/.test(item)) {
        found.push({ menu, item });
        continue;
      }
      await page.getByRole('menuitem', { name: item, exact: true }).hover();
      const sub = page.getByRole('menu').last();
      await expect(sub.getByRole('menuitem').first()).toBeVisible();
      for (const child of await sub.getByRole('menuitem').evaluateAll(els => els.map(e => e.getAttribute('aria-label') || (e.textContent || '').trim()))) {
        found.push({ menu, parent: item, item: child });
      }
    }
    await dismissOverlays(page);
  }
  return found;
}

// One test per menu, so each has its own time limit and a failure names the menu. A menu the user
// doesn't have is skipped; "other menus" catches any drop-down not listed here.
const KNOWN_MENUS: [string, RegExp][] = [
  ['New Experiment Order', /^New Experiment Order/],
  ['Experiments', /^Experiments/],
  ['Workflow', /^Workflow/],
  ['Products', /^Products/],
  ['Configure', /^Configure/],
  ['Reports', /^Reports/],
];

for (const [title, pattern] of [...KNOWN_MENUS, ['other menus', null] as [string, RegExp | null]]) {
  test(`${pattern ? title + " menu" : "any other menu"}: every page opens without an error`, async ({ page }) => {
    // Opening, closing and returning Home takes ~40-50 s per item on a signed-in session.
    test.setTimeout(10 * 60_000);
    await enterApp(page);
    const all = await menuNames(page);
    const menus = pattern ? all.filter(m => pattern.test(m)) : all.filter(m => !KNOWN_MENUS.some(([, p]) => p.test(m)));
    test.skip(menus.length === 0, pattern ? `this user has no ${title} menu` : 'no other drop-down menus');
    await openEveryItem(page, await discoverMenuItems(page, menus));
  });
}

async function openEveryItem(page: Page, items: MenuItem[]): Promise<void> {
  test.info().annotations.push({ type: 'menu items', description: items.map(i => `${i.menu} › ${i.parent ? i.parent + ' › ' : ''}${i.item}`).join('; ') });
  const nav = page.locator('#main-nav');
  for (const entry of items) {
    const label = `${entry.menu.replace(/ menu$/, '')} › ${entry.parent ? entry.parent.replace(/ submenu$/, '') + ' › ' : ''}${entry.item}`;
    if (SKIP_ITEMS.test(entry.item)) {
      test.info().annotations.push({ type: 'skipped menu item', description: label });
      continue;
    }
    await test.step(label, async () => {
      const serverErrors: string[] = [];
      const watch = async (r: import('@playwright/test').Response) => {
        if (!r.url().includes('.gx')) return;
        const text = await r.text().catch(() => '');
        const m = text.match(/"result"\s*:\s*"(ERROR|INVALID)"[^}]*?"message"\s*:\s*"([^"]*)"|"message"\s*:\s*"([^"]*)"[^}]*?"result"\s*:\s*"(ERROR|INVALID)"/);
        if (m) serverErrors.push(`${new URL(r.url()).pathname.split('/').pop()}: ${m[2] || m[3] || m[1] || m[4]}`);
      };
      page.on('response', watch);
      try {
        const urlBefore = page.url();
        await nav.getByRole('button', { name: entry.menu, exact: true }).click();
        if (entry.parent) {
          await page.getByRole('menuitem', { name: entry.parent, exact: true }).hover();
        }
        await page.getByRole('menuitem', { name: entry.item, exact: true }).last().click();
        await waitForSpinner(page);
        await page.waitForURL(u => u.toString() !== urlBefore, { timeout: 5_000 }).catch(() => {});
        await waitForSpinner(page);

        const dialogs = await page.getByRole('dialog').count();
        const opened = dialogs > 0 || page.url() !== urlBefore;
        expect.soft(opened, `${label} should open a page or a dialog`).toBe(true);
        const alerts = await page.getByRole('alertdialog', { name: /^(ERROR|INVALID)$/ }).allInnerTexts();
        expect.soft(alerts.map(a => a.replace(/\s+/g, ' ').trim()), `${label} should not show an error dialog`).toEqual([]);
        expect.soft(serverErrors, `${label} should not get error responses`).toEqual([]);
        if (!dialogs) {
          await expect.soft(page.locator('#main-content'), `${label} should show something`).not.toBeEmpty();
        }
      } finally {
        page.off('response', watch);
        await closeDialogs(page);
        await backHome(page);
      }
    });
  }
}
