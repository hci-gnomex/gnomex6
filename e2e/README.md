# GNomEx end-to-end tests (Playwright)

Browser tests that drive a **running** GNomEx (Tomcat backend + Angular front end) the way a user does.

| File | Covers |
|---|---|
| `tests/login.spec.ts` | Login form renders; unauthenticated deep link redirects to sign-in; unknown user is rejected; Guest Login works; valid user reaches Home; session survives reload; Sign out |
| `tests/browse.spec.ts` | Experiments, Analysis and Data Tracks: open from the header, tree loads, filter-bar Search re-queries, clicking the first tree node shows its details |
| `tests/auth.setup.ts` | Signs in once and saves the session for the browse tests, then warms the server up by loading each browse list once (up to 3 min each; times are logged as `warm-up:` lines) so a cold first query doesn't time out a browse test |
| `tests/browse-pages.ts` | The three browse pages (labels, routes, list endpoints) shared by the browse tests and the warm-up |
| `tests/experiment-detail.spec.ts` | Opens the first experiment: number heading, actions, Order Status; every tab opens and shows content; Experiment Design lists samples |
| `tests/analysis-detail.spec.ts` | Opens the first analysis: number, name, visibility; every tab opens and shows content |
| `tests/datatracks.spec.ts` | Selecting an organism; the data track search box narrows the tree; walking to a data track opens its summary |
| `tests/header.spec.ts` | Lookup by experiment number opens that experiment; text search returns results; Help menu items; About dialog |
| `tests/topics-protocols.spec.ts` | A topic opens with its Info/Visibility tabs; items linked to a topic open; a protocol opens with its details |
| `tests/tree-helpers.ts` | Tree walking (expand folders, open the first item that reaches a page), visit-every-tab, and a check that fails on GNomEx's ERROR dialog |

All of these are read-only: they open, search and switch tabs but never save. They run in the `app` project, after
the sign-in/warm-up step, signed in or as a guest.

These live outside `gnomex_ng` on purpose: Playwright needs **Node 18+**, while the Angular 9 build needs Node 12.

## Setup

1. Have GNomEx running, e.g. deployed to Tomcat at `http://localhost:8080/gnomex/`.
2. Optional: create a **test account that skips Duo**: an external (non u-number) user, or a u-number listed
   in the server's Duo exceptions. Give it access to at least one lab with experiments, analyses and data
   tracks, otherwise the "first tree node" tests skip. Before typing a password the tests read the server's
   Duo settings and skip if the account would get a Duo prompt, so a run never sends a push.
3. Configure:
   ```bash
   cp .env.example .env      # then fill in GNOMEX_BASE_URL, GNOMEX_USER, GNOMEX_PASSWORD
   ```
   `.env` is git-ignored. Don't use a real person's account.
4. Install (with Node 18+ on PATH):
   ```bash
   npm install
   ```
   No browser download is needed on Windows: if Playwright's Chromium isn't installed the tests use Edge.
   On Linux/CI, run `npx playwright install --with-deps chromium` once.

## Running

```bash
npm test                 # headless
npm run test:headed      # watch it drive the browser
npm run test:ui          # Playwright UI mode: pick tests, time-travel through steps
npm run report           # open the HTML report from the last run
```

Or from the repo root, which finds a Node 18+ install automatically even when Node 12 is the default:

```bash
powershell -ExecutionPolicy Bypass -File scripts/run-tests.ps1 -E2E
```

Without `GNOMEX_USER`/`GNOMEX_PASSWORD` the sign-in tests skip and the browse tests use **Guest Login**
(public data only), provided the server allows guest access. To force a guest run even when `.env` has an
account, blank the variables for that run: `GNOMEX_USER= GNOMEX_PASSWORD= npm test`.

Other settings: `GNOMEX_DATATRACK_SEARCH` (default `hg19`) is the term the data track search test uses, and
`TREE_DEBUG=1` logs each step of the tree walks when working out why a test found nothing to open.

The header **text search** test fails on servers without a Lucene index, quoting the server's error
(`directory '.../luceneIndex/global' does not exist`). Build the index with `scripts/index_gnomex.*`.

Failures keep a screenshot, video and trace in `test-results/`; open a trace with
`npx playwright show-trace <path>/trace.zip`.

## Notes for writing more tests

- The app has no `data-testid`s. Use roles and accessible names (`getByRole('tree', { name: 'Experiments hierarchy' })`),
  which the recent ARIA work made reliable.
- After login the app runs ~10 startup calls before the header appears: use `waitForAppReady()`.
- Clicking a tree node opens a modal "Please wait..." spinner: use `waitForSpinner()`.
- Deep links such as `/experiments` bounce through `/home` until the app has loaded, so tests navigate from
  Home through the header (`openFromNav()`).
- The Login button isn't a submit button; pressing Enter doesn't sign in.
