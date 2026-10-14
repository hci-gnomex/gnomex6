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

    const where = await page.evaluate(() => {
      const active = document.activeElement;
      const inside = (id: string) => { const el = document.getElementById(id); return !!el && !!active && el.contains(active); };
      return { mainNav: inside('main-nav'), mainContent: inside('main-content'), banner: !!active && !!active.closest('[role=banner], header') };
    });
    expect(where.mainNav || where.mainContent, 'focus should move past the header toolbar').toBe(true);
    // Seen 2026-10: skipToMain() focuses the first button of the main navigation, not #main-content,
    // so the link does less than its name says.
    expect.soft(where.mainContent, 'focus should land in #main-content, as the link\'s name says').toBe(true);
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
