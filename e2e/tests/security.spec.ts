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

  const fields = ['salt', 'guid', 'guidExpiration', 'confirmEmailGuid', 'passwordExternal', 'password'];
  const exposed: string[] = [];
  for (const id of labIds) {
    const body = await (await page.request.get(`GetLab.gx?idLab=${id}`)).text();
    const counts = fields.map(f => [f, nonEmpty(body, f)] as const).filter(([, n]) => n > 0);
    if (counts.length) {
      exposed.push(`idLab ${id}: ${counts.map(([f, n]) => `${n} ${f}`).join(', ')}`);
    }
  }
  // Seen 2026-10 (fixed in AppUser.registerMethodsToExcludeFromXML): an ordinary user received
  // other users' password salts and password-reset GUIDs in the lab's member and submitter lists.
  expect(exposed, 'lab details sent to the browser should not include credential fields').toEqual([]);
});
