import { expect, test } from '@playwright/test';
import { enterApp } from './browse-pages';
import { hasCredentials } from './helpers';

// One user's slow request must not hold up everyone else. Read-only.
//
// Seen 2026-11: GetDataTrackList.gx takes ~50 s for a signed-in ordinary user, and requests made
// meanwhile queued behind it. A GetPropertyList.gx started at 07:30:09 only finished after the data
// track list did, and the next test's GetPropertyList.gx and GetLoginProperties.gx hung and then
// failed with HTTP 500, so the sign-in page never loaded. Three test runs that day stalled this way,
// each right after a data track test.

test('the sign-in page still loads while another user lists data tracks', async ({ page, playwright }) => {
  test.skip(!hasCredentials, 'needs a signed-in user to make the slow request');
  test.slow();
  await enterApp(page);

  // Start the slow request for the signed-in user and don't wait for it yet.
  const started = Date.now();
  const slow = page.request.get('GetDataTrackList.gx?isVisibilityPublic=Y&isVisibilityOwner=Y&isVisibilityMembers=Y&isVisibilityInstitute=Y',
    { timeout: 180_000 });
  await page.waitForTimeout(3_000); // let it get going on the server

  // Meanwhile someone else, not signed in, opens the sign-in page.
  const other = await playwright.request.newContext({ baseURL: test.info().project.use.baseURL, ignoreHTTPSErrors: true });
  try {
    const t0 = Date.now();
    const props = await other.get('GetLoginProperties.gx', { timeout: 60_000 }).catch(e => e as Error);
    const waited = (Date.now() - t0) / 1000;
    const slowStillRunning = await Promise.race([slow.then(() => false, () => false), Promise.resolve(true)]);
    test.info().annotations.push({ type: 'timing', description: `GetLoginProperties took ${waited.toFixed(1)} s; data track list still running: ${slowStillRunning}` });

    expect(props instanceof Error ? props.message : props.status(), 'the sign-in settings should be served').toBe(200);
    expect(waited, 'and promptly, not after the other user\'s data track list').toBeLessThan(10);
  } finally {
    await other.dispose();
    const response = await slow.catch(() => null);
    test.info().annotations.push({ type: 'timing', description: `GetDataTrackList took ${((Date.now() - started) / 1000).toFixed(1)} s, status ${response ? response.status() : 'failed'}` });
  }
});
