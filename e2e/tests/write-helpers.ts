import { expect, Locator, Page, test } from '@playwright/test';
import { hasCredentials } from './helpers';

// Shared pieces for the *.write.spec.ts tests, which create and change data.

/** Small lab the write tests create their data in (and delete it again). */
export const WRITE_LAB = process.env.GNOMEX_WRITE_LAB || '';

/**
 * Skips unless writes are explicitly allowed and the server is local: these tests save data, so they
 * must only ever run against a throwaway database, never a shared server.
 */
export function requireWritableServer(): void {
  const base = process.env.GNOMEX_BASE_URL || '';
  test.skip(process.env.GNOMEX_ALLOW_WRITES !== 'yes',
    'Write tests change data. Set GNOMEX_ALLOW_WRITES=yes, and only against a throwaway database.');
  test.skip(!/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(base),
    `Write tests only run against localhost, not ${base}.`);
  test.skip(!hasCredentials, 'Write tests need GNOMEX_USER and GNOMEX_PASSWORD.');
  test.skip(!WRITE_LAB, 'Set GNOMEX_WRITE_LAB to a small lab the tests can create data in.');
}

/** A name that marks data as test data and won't collide with other runs: e2e-<kind>-<time>-<rand>. */
export function uniqueName(kind: string): string {
  const time = new Date().toISOString().replace(/\D/g, '').slice(2, 14);
  return `e2e-${kind}-${time}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Types into a searchable combobox and picks the exact option (options render in an overlay). */
export async function pickOption(page: Page, combobox: Locator, option: string): Promise<void> {
  await combobox.click();
  await combobox.fill(option);
  await page.getByRole('option', { name: option, exact: true }).first().click();
}

/**
 * Remembers server-side cleanup calls for things a test creates, so they're removed even when the
 * test fails half-way. Call `run(page)` from afterEach; it uses the page's signed-in session.
 */
export class Cleanup {
  private urls: string[] = [];

  add(relativeUrl: string): void {
    this.urls.push(relativeUrl);
  }

  /** Drops a pending cleanup once the test itself has deleted the item through the UI. */
  done(relativeUrl: string): void {
    this.urls = this.urls.filter(u => u !== relativeUrl);
  }

  async run(page: Page): Promise<void> {
    for (const url of this.urls.splice(0)) {
      const response = await page.request.get(url).catch(() => null);
      if (!response || !response.ok()) {
        console.warn(`cleanup: ${url} failed (${response ? response.status() : 'no response'}); remove it by hand`);
      }
    }
  }
}

/** Reads an id field ("idProject", "idTopic"...) from a save response, however the server formats it. */
export async function idFromResponse(text: string, field: string): Promise<string> {
  const match = text.match(new RegExp(`"?${field}"?\\s*[:=]\\s*"?(\\d+)`));
  expect(match, `the save response should contain ${field}: ${text.slice(0, 200)}`).not.toBeNull();
  return match![1];
}
