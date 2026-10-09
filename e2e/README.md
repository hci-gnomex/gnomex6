# GNomEx end-to-end tests (Playwright)

Browser tests that drive a **running** GNomEx (Tomcat backend + Angular front end) the way a user does.

| File | Covers |
|---|---|
| `tests/login.spec.ts` | Login form renders; unauthenticated deep link redirects to sign-in; unknown user is rejected; Guest Login works; valid user reaches Home; session survives reload; Sign out |
| `tests/browse.spec.ts` | Experiments, Analysis and Data Tracks: open from the header, tree loads, filter-bar Search re-queries, clicking the first tree node shows its details |
| `tests/experiment-detail.spec.ts` | Opens the first experiment: number heading, actions, Order Status; every tab opens and shows content; Experiment Design lists samples |
| `tests/analysis-detail.spec.ts` | Opens the first analysis: number, name, visibility; every tab opens and shows content |
| `tests/datatracks.spec.ts` | Selecting an organism; the data track search box narrows the tree; walking to a data track opens its summary |
| `tests/header.spec.ts` | Lookup by experiment number opens that experiment; text search returns results; Help menu items; About dialog |
| `tests/topics-protocols.spec.ts` | A topic opens with its Info/Visibility tabs; items linked to a topic open; a protocol opens with its details |
| `tests/projects.write.spec.ts` | **Changes data.** Creates a project and opens it; renames one; deletes one from the tree |
| `tests/topics.write.spec.ts` | **Changes data.** Creates a topic and opens it; renames one; deletes one |
| `tests/analysis-groups.write.spec.ts` | **Changes data.** Creates an analysis group under its lab and opens it; deletes one |
| `tests/warm-up.setup.ts` | Runs first: loads each browse list once (up to 3 min each; times are logged as `warm-up:` lines) so a cold first query doesn't time out a test |
| `tests/browse-pages.ts` | The three browse pages, `enterApp()` (sign in, or Guest Login) and `openBrowsePage()` (including the admin lab picker) |
| `tests/tree-helpers.ts` | Tree walking (expand folders, open the first item that reaches a page), visit-every-tab, and a check that fails on GNomEx's ERROR/INVALID dialogs |
| `tests/write-helpers.ts` | The write-test guard, `e2e-` names, and cleanup that removes created data even when a test fails |

Everything except `*.write.spec.ts` is read-only: it opens, searches and switches tabs but never saves.
Read-only tests run in the `app` project, write tests in the `writes` project; both after the warm-up.

These live outside `gnomex_ng` on purpose: Playwright needs **Node 18+**, while the Angular 9 build needs Node 12.

## Setup

1. Have GNomEx running, e.g. deployed to Tomcat at `http://localhost:8080/gnomex/`.
2. Optional: create a **test account that skips Duo**: an external (non u-number) user, or a u-number listed
   in the server's Duo exceptions. Before typing a password the tests read the server's Duo settings and
   skip if the account would get a Duo prompt, so a run never sends a push.
3. Configure:
   ```bash
   cp .env.example .env      # then fill it in; see the comments in .env.example
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

### Who the tests sign in as

- **No account** (`GNOMEX_USER`/`GNOMEX_PASSWORD` empty): the sign-in tests skip and the rest use **Guest Login**
  (public data only), provided the server allows guest access. To force a guest run even when `.env` has an
  account, blank the variables for that run: `GNOMEX_USER= GNOMEX_PASSWORD= npm test`.
- **An account**: each test signs in through the form. (GNomEx's sign-in token expires after 15 minutes, so
  one saved session can't last a whole run.)
- **An admin account** opens Experiments/Analysis/Data Tracks with an empty "Select a lab..." filter, so set
  `GNOMEX_LAB` to the lab to browse; the tests pick it and press Search.

### Write tests (create/edit)

`*.write.spec.ts` create, change and delete data. They **skip** unless all of these hold:

- `GNOMEX_ALLOW_WRITES=yes`
- `GNOMEX_BASE_URL` is on `localhost` (they refuse any other server)
- an account is set, and `GNOMEX_WRITE_LAB` names a small lab to create data in

Use them only against a **throwaway database**. Everything they create is named `e2e-<kind>-<time>-<random>` and
deleted again, through the UI or, if a test fails half-way, through GNomEx's own delete call afterwards.

```bash
GNOMEX_ALLOW_WRITES=yes npx playwright test --project=writes
```

`GNOMEX_WRITE_LAB` must be **active** and have the test account as a **member**. Otherwise new topics can't
be saved (Owner is required and only "None" is offered) and GNomEx shows "INVALID: Insufficient permission to
access this request or this lab" around project deletes.

Two rename checks are "soft" (reported as failures, but the test carries on): after a rename, the project
overview heading and the "Topic Tnn - name" heading keep the old name until the page is reloaded, although the
tree and the saved data have the new name.

### Other settings

`GNOMEX_DATATRACK_SEARCH` (default `hg19`) is the term the data track search test uses, and `TREE_DEBUG=1`
logs each step of the tree walks when working out why a test found nothing to open.

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
- Angular Material dialogs appear twice in the accessibility tree (the container and GNomEx's inner dialog
  share the name), so use `.first()`; Material select options render in an overlay, so find them on `page`.
- Trees are virtually scrolled: only ~50 rows exist in the page. Use a small lab for anything you need to find.
