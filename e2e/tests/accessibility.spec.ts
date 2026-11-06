import { expect, Locator, Page, test } from '@playwright/test';
import { browsePages, enterApp, openBrowsePage } from './browse-pages';
import { hasCredentials } from './helpers';

// Keyboard and screen-reader behaviour added by the ARIA work. Read-only.

const experiments = browsePages.find(p => p.name === 'experiments')!;

/** The tree item that aria-activedescendant currently points at. */
async function activeItem(page: Page, tree: Locator): Promise<Locator> {
  const id = await tree.getAttribute('aria-activedescendant');
  expect(id, 'the tree should report its focused item in aria-activedescendant').toBeTruthy();
  return page.locator(`[id="${id}"]`);
}

test.describe('keyboard', () => {
  test.beforeEach(async ({ page }) => {
    await enterApp(page);
  });

  test('the experiments tree can be navigated with the arrow keys', async ({ page }) => {
    await openBrowsePage(page, experiments);
    const tree = page.getByRole('tree', { name: experiments.tree });
    const items = tree.getByRole('treeitem');
    test.skip(await items.count() < 3, 'needs at least three items in the tree');

    // The tree is a single Tab stop; focusing it focuses its first item.
    await tree.focus();
    await expect(tree).toHaveAttribute('aria-activedescendant', /-node-/);
    const first = await activeItem(page, tree);
    await expect(first).toHaveAttribute('aria-label', (await items.nth(0).getAttribute('aria-label'))!);

    await page.keyboard.press('ArrowDown');
    await expect(await activeItem(page, tree)).toHaveAttribute('aria-label', (await items.nth(1).getAttribute('aria-label'))!);
    await page.keyboard.press('ArrowDown');
    await expect(await activeItem(page, tree)).toHaveAttribute('aria-label', (await items.nth(2).getAttribute('aria-label'))!);
    await page.keyboard.press('ArrowUp');
    await expect(await activeItem(page, tree)).toHaveAttribute('aria-label', (await items.nth(1).getAttribute('aria-label'))!);
  });

  test('ArrowLeft collapses and ArrowRight expands a folder', async ({ page }) => {
    await openBrowsePage(page, experiments);
    const tree = page.getByRole('tree', { name: experiments.tree });
    const folder = tree.locator('[role=treeitem][aria-expanded=true]').first();
    test.skip(await folder.count() === 0, 'needs an expanded folder in the tree');
    const label = (await folder.getAttribute('aria-label'))!;
    const node = tree.getByRole('treeitem', { name: label, exact: true }).first();

    await tree.focus();
    // Move focus to the folder (it's the first expanded item, so walk down until we reach it).
    for (let i = 0; i < 50 && (await (await activeItem(page, tree)).getAttribute('aria-label')) !== label; i++) {
      await page.keyboard.press('ArrowDown');
    }
    await page.keyboard.press('ArrowLeft');
    await expect(node).toHaveAttribute('aria-expanded', 'false');
    await page.keyboard.press('ArrowRight');
    await expect(node).toHaveAttribute('aria-expanded', 'true');
  });

  test('Enter on a focused item selects it', async ({ page }) => {
    await openBrowsePage(page, experiments);
    const tree = page.getByRole('tree', { name: experiments.tree });
    test.skip(await tree.getByRole('treeitem').count() < 2, 'needs at least two items in the tree');
    await tree.focus();
    await page.keyboard.press('ArrowDown');
    const target = await activeItem(page, tree);
    await page.keyboard.press('Enter');
    await expect(target).toHaveAttribute('aria-selected', 'true');
  });

  test('"Skip to main content" moves focus past the header', async ({ page }) => {
    // The skip link is only rendered for signed-in users (*ngIf="isLoggedIn"), not for guests.
    test.skip(!hasCredentials, 'The skip link only exists for signed-in users; set GNOMEX_USER/GNOMEX_PASSWORD.');
    const skip = page.getByRole('button', { name: 'Skip to main content' });
    await expect(skip).toBeAttached();
    await skip.focus();
    await expect(skip).toBeVisible();   // visually hidden until it has focus
    await page.keyboard.press('Enter');

    const focusIn = () => page.evaluate(() => {
      const active = document.activeElement;
      const inside = (id: string) => { const el = document.getElementById(id); return !!el && !!active && el.contains(active); };
      return { mainNav: inside('main-nav'), mainContent: inside('main-content') };
    });
    // Seen 2026-10: it focused the first button of the main navigation instead.
    expect(await focusIn(), 'focus should land in #main-content, as the link\'s name says')
      .toEqual({ mainNav: false, mainContent: true });

    // The next Tab goes to the page's own first control, not back into the header.
    await page.keyboard.press('Tab');
    expect(await focusIn(), 'Tab after skipping should stay in the page content')
      .toEqual({ mainNav: false, mainContent: true });
    await expect(page.locator('#main-content'), 'main is focusable only while it holds the skip focus')
      .not.toHaveAttribute('tabindex');
  });
});

test.describe('menus and dialogs from the keyboard', () => {
  test.beforeEach(async ({ page }) => {
    await enterApp(page);
  });

  test('the Help menu opens, moves and closes with the keyboard', async ({ page }) => {
    const help = page.getByRole('button', { name: 'Help menu' });
    await help.focus();
    await page.keyboard.press('Enter');
    const menu = page.getByRole('menu');
    await expect(menu.getByRole('menuitem', { name: 'User Guide' })).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(menu.getByRole('menuitem', { name: 'About' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(help, 'Escape returns focus to the button that opened the menu').toBeFocused();
  });

  test('a dialog opened from the keyboard takes the focus', async ({ page }) => {
    await page.getByRole('button', { name: 'Help menu' }).focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter'); // About
    const about = page.getByRole('dialog', { name: 'About', exact: true });
    await expect(about).toBeVisible();

    // GNomEx dialogs are non-modal (no backdrop), so nothing else keeps focus in them; WCAG 2.4.3.
    const inDialog = () => about.evaluate(d => d.contains(document.activeElement));
    await expect.poll(inDialog, { message: 'focus should move into the About dialog' }).toBe(true);
    await page.keyboard.press('Tab');
    expect(await inDialog(), 'Tab should stay in the dialog').toBe(true);

    await about.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(about).toBeHidden();
  });
});

test.describe('toggles report their state', () => {
  test.beforeEach(async ({ page }) => {
    await enterApp(page);
  });

  test('pinning the header', async ({ page }) => {
    const pin = page.getByRole('banner').getByRole('button', { name: /^(Unpin|Pin) header$/ });
    const before = await pin.getAttribute('aria-pressed');
    await pin.click();
    await expect(pin).not.toHaveAttribute('aria-pressed', before ?? '');
    await expect(pin).toHaveAccessibleName(before === 'true' ? 'Pin header' : 'Unpin header');
    await pin.click();
    await expect(pin).toHaveAttribute('aria-pressed', before ?? '');
  });

  test('collapsing and expanding the browse filter', async ({ page }) => {
    await openBrowsePage(page, experiments);
    const filter = page.getByRole('search', { name: 'Browse filter' });
    const toggle = filter.getByRole('button', { name: /^(Collapse|Expand) filter options$/ });
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toHaveAccessibleName('Expand filter options');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(toggle).toHaveAccessibleName('Collapse filter options');
  });
});
