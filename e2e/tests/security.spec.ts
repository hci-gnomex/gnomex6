import { expect, Response, test } from '@playwright/test';
import { browsePages, enterApp, openBrowsePage } from './browse-pages';
import { openFirstMatching } from './tree-helpers';

// API-level checks on what the server sends to the browser. Read-only. Values are never printed:
// failures report only how many fields were exposed.

// A lab id that exists on most GNomEx installs is not guaranteed, so use the labs the user can list.
async function someLabIds(request: import('@playwright/test').APIRequestContext): Promise<string[]> {
  const body = await (await request.get('GetLabList.gx?listKind=UnboundedLabList')).text();
  return [...new Set([...body.matchAll(/"idLab"\s*:\s*"(\d+)"/g)].map(m => m[1]))].slice(0, 5);
}

/** Fields that must never reach the browser: password hashes and salts, and one-time tokens. */
const SECRET_FIELDS = ['salt', 'guid', 'guidExpiration', 'confirmEmailGuid', 'passwordExternal', 'password'];

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
    const counts = SECRET_FIELDS.map(f => [f, nonEmpty(body, f)] as const).filter(([, n]) => n > 0);
    if (counts.length) {
      exposed.push(`idLab ${id}: ${counts.map(([f, n]) => `${n} ${f}`).join(', ')}`);
    }
  }
  // Seen 2026-10 (fixed in AppUser.registerMethodsToExcludeFromXML): an ordinary user received
  // other users' password salts and password-reset GUIDs in the lab's member and submitter lists.
  expect(exposed, 'lab details sent to the browser should not include credential fields').toEqual([]);
});

test('pages a user browses are not sent credential fields', async ({ page }) => {
  // Watches every server response while opening an experiment and an analysis (their detail pages
  // load the submitter, lab members, collaborators...), so a leak through any command shows up.
  const exposed = new Map<string, number>();
  const watch = async (r: Response) => {
    if (!/\.gx(\?|$)|\/api\//.test(r.url())) return;
    const body = await r.text().catch(() => '');
    const command = new URL(r.url()).pathname.split('/').pop()!;
    for (const field of SECRET_FIELDS) {
      const n = nonEmpty(body, field);
      if (n) exposed.set(`${command}: ${field}`, (exposed.get(`${command}: ${field}`) || 0) + n);
    }
  };
  page.on('response', watch);

  await enterApp(page);
  for (const [name, route] of [['experiments', /\/experiments\/detail\/\d+/], ['analysis', /\/analysis\/detail\/\d+/]] as const) {
    const p = browsePages.find(b => b.name === name)!;
    await openBrowsePage(page, p);
    await openFirstMatching(page, page.getByRole('tree', { name: p.tree }), route);
  }
  page.off('response', watch);

  expect([...exposed].map(([where, n]) => `${where} (${n})`), 'responses should not include credential fields').toEqual([]);
});

test('signed-out requests get no data', async ({ playwright }) => {
  // A separate request context: no session cookie, as if someone called the server directly.
  const anonymous = await playwright.request.newContext({ baseURL: test.info().project.use.baseURL, ignoreHTTPSErrors: true });
  const commands = [
    'GetLabList.gx?listKind=UnboundedLabList',
    'GetLab.gx?idLab=1',
    'GetProjectRequestList.gx',
    'GetAnalysisGroupList.gx',
    'GetAppUserList.gx',
    'GetRequest.gx?requestNumber=1R',
  ];
  const answered: string[] = [];
  for (const command of commands) {
    const response = await anonymous.get(command);
    const body = await response.text();
    let result = '';
    try { result = JSON.parse(body).result || ''; } catch { /* not JSON */ }
    // The server answers 200 with {"result":"INVALID","message":"...Please login."}.
    const refused = response.status() === 401 || response.status() === 403 || /^(INVALID|ERROR)$/.test(result);
    if (!refused || /"id(Lab|AppUser|Request|Project)"\s*:/.test(body)) {
      answered.push(`${command}: HTTP ${response.status()}, ${body.length} bytes`);
    }
  }
  await anonymous.dispose();
  expect(answered, 'commands should refuse a caller who is not signed in').toEqual([]);
});
