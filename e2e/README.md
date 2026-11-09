# GNomEx end-to-end tests (Playwright)

Browser tests that drive a **running** GNomEx (Tomcat backend + Angular front end) the way a user does.

| File | Covers |
|---|---|
| `tests/login.spec.ts` | Login form renders; unauthenticated deep link redirects to sign-in; unknown user is rejected; Guest Login works; valid user reaches Home; Enter in the password box signs in; session survives reload; Sign out; after signing out, Back doesn't reopen the app or load data |
| `tests/browse.spec.ts` | Experiments, Analysis and Data Tracks: open from the header, tree loads, filter-bar Search re-queries, clicking the first tree node shows its details |
| `tests/browse-filters.spec.ts` | The Experiments (My experiments / My collaborations / Public data / All / My lab) and Analysis (My analyses / Other labs / All / My lab) filters send the matching list parameters, leave none behind, and the list loads (ordinary users; admins skip) |
| `tests/experiment-detail.spec.ts` | Opens the first experiment: number heading, actions, Overview; every tab opens and shows content; Experiment Design lists samples; Share URL links to the experiment and copies it |
| `tests/analysis-detail.spec.ts` | Opens the first analysis: number, name, visibility; every tab opens and shows content |
| `tests/datatracks.spec.ts` | Selecting an organism; the data track search box narrows the tree; walking to a data track opens its summary |
| `tests/header.spec.ts` | Lookup by experiment number opens that experiment; text search returns results; Help menu items; About dialog; Help › User Guide and each Links menu item (the configured quick links) open their link in a new tab and leave the current page as it was (outside sites are answered with a stub page, not loaded) |
| `tests/topics-protocols.spec.ts` | A topic opens with its Info/Visibility tabs; items linked to a topic open; a protocol opens with its details |
| `tests/accessibility.spec.ts` | Keyboard: arrow keys move through the Experiments tree (aria-activedescendant), ArrowLeft/Right collapse/expand, Enter selects; "Skip to main content" (signed-in only); the Help menu opens, moves and closes (returning focus) with the keyboard; a dialog opened from the keyboard takes the focus; pin-header and filter collapse toggles report aria-pressed/aria-expanded |
| `tests/page-titles.spec.ts` | The browser tab title names the page (sign-in, Home, Experiments list and detail, after Back, Analysis, Topics) |
| `tests/share-links.spec.ts` | Share URL links for an experiment, an analysis, a data track and a topic, followed in the browser, open that item (and select it in the tree); a link to an unknown experiment explains the problem |
| `tests/dialogs.spec.ts` | Unknown experiment number explains the problem; Report Problem form opens and closes without sending; Contact Us lists email links; the date filter adds/removes `createDateFrom`/`createDateTo` |
| `tests/responsiveness.spec.ts` | While a signed-in user's slow data track list (~50 s) is running, a signed-out visitor still gets the sign-in settings (`GetLoginProperties.gx`) within 10 s; both timings are recorded |
| `tests/search.spec.ts` | Header text search ("RNA", or `GNOMEX_SEARCH_TERM`): All Results equals the sum of the categories; each category filter shows only that kind; double-clicking a result opens it. Skips on servers without a search index |
| `tests/security.spec.ts` | `GetLab.gx`, and every response while opening an experiment and an analysis, must not send password salts, reset GUIDs or passwords to the browser (counts only, values never printed); data commands refuse callers who aren't signed in |
| `tests/account.spec.ts` | My Account shows the user's own details; the password boxes never hold the real password (compared as true/false, never printed); Save is disabled for a missing name, a bad email or mismatched passwords, and nothing is saved; Request Lab Membership opens and cancels without sending |
| `tests/downloads.spec.ts` | Download Files: Download starts disabled with nothing chosen; where the experiment has files, adding them enables it and updates the count and removing them resets both; Cancel closes without fetching any file; the sample sheet downloads as a non-empty spreadsheet/text file |
| `tests/a11y-basics.spec.ts` | Sign-in, Home, Experiments and Analysis (list and detail), Topics, My Account, the three Reports pages: images have alt text, buttons/links and form fields have names, one main landmark (soft checks, so a run lists every problem) |
| `tests/edit-mode.spec.ts` | Analysis edit mode: Edit unlocks the fields and View locks them; leaving with unsaved changes asks first and No keeps editing; discarding shows the saved values again. Nothing is saved (any Save*.gx request fails the test) |
| `tests/products.spec.ts` | Products › Product Orders: the order list is requested on opening; the Status filter sends the chosen status and an empty result isn't reported as an error; the Detail view shows orders by lab with Delete disabled. Product Ledger: the list is requested on opening and again for the chosen lab and product. Order Products: only labs that can order from the core are offered, products wait for a billing account, a quantity of 2 totals twice the price (also with a faked $12.50 price, so cents count), a negative quantity counts as none, and Submit needs a quantity and the charge consent. Never presses Go, Delete, Save or Submit |
| `tests/signup-reset.spec.ts` | Signed out: Reset Password opens from sign-in, needs a username or email and switches between them; New Account lists each core facility with a link to its sign-up form; that public data names labs and cores only (no contact details); the sign-up form flags a bad email, a u-number as an external username, a weak or mismatched password, and enables Submit only when complete (with or without university sign-in; a faked "no university sign-in" reply checks that form can be completed whatever the server sends). Never presses Submit |
| `tests/reports.spec.ts` | Reports › Project/Experiment Report, Annotation Report (with an annotation and a custom column chosen) and Annotation Progress Report run and return an Excel/CSV file, not an error or an empty page. Ordinary users report on their own labs ("All Labs..."); admins pick `GNOMEX_LAB` |
| `tests/configure.spec.ts` | Configure › Organisms and Genome Builds: the list loads, an organism opens with its details and genome builds, Sort Order rejects letters and over 5 digits and flags unsaved edits. Configure › Annotations: an annotation opens with its settings on each tab; "Show Annotations For" Samples/Analysis/Data Tracks/Experiments lists only annotations for that kind; an empty name is flagged and can't be saved. Never presses Save, Add or Remove |
| `tests/new-experiment.spec.ts` | New Experiment Order wizard, Setup step: opens with Back/Next disabled; a service category names the experiment and lists the later steps (disabled); a lab brings the payment method, and an account the project; Cancel asks first (No stays, Yes goes Home). Never submits |
| `tests/billing-account.spec.ts` | Experiments › New Billing Account: opens for a Chartfield account with Save disabled and core facilities waiting for a lab; each Chartfield segment needs its number of digits (Activity or Project); Save enables only when complete and the terms are agreed to; PO swaps in purchase order details. Never presses Save |
| `tests/experiments-menu.spec.ts` | Experiments › New Project needs a lab and a name before Save enables, and Cancel saves nothing. Upload Experiment data enables Next only once lab, organism, platform, experiment type and project are chosen. Add Additional Illumina Sequencing Lanes asks for a lab's Illumina experiments only once a service is chosen, for the chosen period (3 months by default), and picking an experiment enables Next. Never saves |
| `tests/menu-pages.spec.ts` | One test per drop-down menu (New Experiment Order, Experiments, Workflow, Products, Configure, Reports, any other): opens every item and checks for no ERROR/INVALID dialog, no error responses, visible content and a page title of its own; dialogs are closed with Cancel/Close; menus the user lacks are skipped |
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

Use them only against a **throwaway database**. The `localhost` check only proves Tomcat is local, not its
database: a local Tomcat can point at a shared server (see `hci.gnomex.url` in Tomcat's `conf/catalina.properties`),
so confirm that database is disposable before setting `GNOMEX_ALLOW_WRITES=yes`. Everything they create is named `e2e-<kind>-<time>-<random>` and
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
- Angular Material radio buttons hide their input under the label, so `check()` times out: use `pickRadio()`.
  In Material 9 a `mat-select` has role `listbox`, not `combobox`.
- `openMenuItem(page, 'Configure', 'Configure Annotations')` opens a header menu item and skips if the user
  lacks it; `watchChanges(page)` records Save/Delete/Submit/Change/Update/Approve calls so read-only tests can
  assert nothing was saved (Create* is left out: sign-in calls CreateSecurityAdvisor.gx).
- `chooseOption(page, dropDown, [LAB])` picks the first preferred option a drop-down lists, else its first real one,
  and returns its text (null if empty). It waits for the list, which often fills in after its request returns.
- A GNomEx alert (e.g. "No experiments found") is modal and hides the rest of the page from the accessibility
  tree, so close it before asserting anything else.
- ag-grids have no accessible name (their `aria-label` sits on `<ag-grid-angular>`, which has no role), so find a
  grid by one of its column headers.
