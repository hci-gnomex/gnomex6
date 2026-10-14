import { expect, test } from '@playwright/test';
import { enterApp } from './browse-pages';

// API-level checks on what the server sends to the browser. Read-only. Values are never printed:
// failures report only how many fields were exposed.

// A lab id that exists on most GNomEx installs is not guaranteed, so use the labs the user can list.
async function someLabIds(request: import('@playwright/test').APIRequestContext): Promise<string[]> {
  const body = await (await request.get('GetLabList.gx?listKind=UnboundedLabList')).text();
  return [...new Set([...body.matchAll(/"idLab"\s*:\s*"(\d+)"/g)].map(m => m[1]))].slice(0, 5);
}

/** Counts non-empty values of a JSON field anywhere in a response body. */
function nonEmpty(body: string, field: string): number {
  return [...body.matchAll(new RegExp(`"${field}"\\s*:\\s*"([^"]+)"`, 'g'))].length;
}

test('GetLab.gx does not expose password salts or reset tokens', async ({ page }) => {
  await enterApp(page);
  const labIds = await someLabIds(page.request);
  test.skip(labIds.length === 0, 'this user cannot list any labs');

  const exposed: string[] = [];
  for (const id of labIds) {
    const body = await (await page.request.get(`GetLab.gx?idLab=${id}`)).text();
    const salts = nonEmpty(body, 'salt');
    const guids = nonEmpty(body, 'guid');
    const passwords = nonEmpty(body, 'password');
    if (salts || guids || passwords) {
      exposed.push(`idLab ${id}: ${salts} salt, ${guids} guid, ${passwords} password value(s)`);
    }
  }
  // Seen 2026-10: an ordinary user received other users' password salts and password-reset GUIDs
  // (AppUser objects serialised in full in the members/collaborators/managers lists).
  expect(exposed, 'lab details sent to the browser should not include credential fields').toEqual([]);
});
