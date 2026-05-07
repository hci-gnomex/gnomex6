# CSS Globalization Refactoring Plan — gnomex6

## Current State Summary

| Item | Count |
|---|---|
| Total Angular components | 235 |
| Components with inline `styles: [...]` | 221 (94%) |
| HTML templates with `style="..."` attributes | 51 files / 246 instances |
| External component stylesheets | 1 (`tabs.component.css`) |
| Global stylesheets | 3 (`styles.css` 1033 lines, `gnomex-app-color.css` 398 lines, `material-theme.scss` 69 lines) |
| CSS custom properties defined | 345 |
| CSS custom properties actually used | ~42 (12%) |

---

## Phase 0 — Preparation (do this first, before touching any CSS)

### 0.1 Establish a baseline
- Run `ng build` and capture the output size and any warnings — this is the regression baseline.
- Take screenshots of the key screens (login, browse experiments, browse analysis, experiment detail) so visual regressions can be spotted.
- Commit everything on a new branch `css-globalization` off `main`.

### 0.2 Standardize on SCSS
The project mixes `.css`, `.scss`, and `.less`. Standardize on SCSS going forward.
- Rename `src/styles.css` → `src/styles.scss` and update the `styles` array in `angular.json`.
- Rename `src/gnomex-app-color.css` → `src/gnomex-app-color.scss` and update the `@import` in `styles.scss`.
- Delete `src/app/experiments/browse-experiments-component.less` after migrating its rules (see Phase 5).

### 0.3 Organize the global files into partials

Create a `src/styles/` folder with this structure:

```
gnomex_ng/src/styles/
├── _variables.scss       ← all CSS custom properties from gnomex-app-color.scss
├── _reset.scss           ← html/body/global resets currently in styles.scss
├── _layout.scss          ← flexbox layout utilities extracted from components
├── _typography.scss      ← font, text, heading rules
├── _forms.scss           ← input, select, readonly, disabled states
├── _buttons.scss         ← button variants and states
├── _colors.scss          ← hardcoded-color replacements (use CSS vars)
├── _grids.scss           ← ag-Grid and Angular tree overrides
├── _material.scss        ← Angular Material overrides (consolidate from styles.scss)
├── _navigation.scss      ← nav, header, sidebar rules
├── _vendors.scss         ← third-party component deep overrides
├── _accessibility.scss   ← aria, focus-visible, contrast overrides
└── index.scss            ← @forward each partial above
```

Update `angular.json` `styles` array:

```json
"styles": [
  "src/material-theme.scss",
  "src/styles/index.scss",
  "node_modules/font-awesome/css/font-awesome.min.css"
]
```

---

## Phase 1 — Extract Inline Component Styles (221 components)

This is the largest phase. The goal is to remove every `styles: [...]` array from `.component.ts` files and move the CSS into the appropriate global partial.

### 1.1 Categorize the inline styles before touching them

Run a grep to dump all inline style blocks grouped by component:

```bash
grep -rn "styles: \[" gnomex_ng/src/app --include="*.ts" -A 30
```

Sort rules into these buckets:

| Bucket | Examples | Target partial |
|---|---|---|
| Flexbox layout utilities | `display:flex`, `flex-direction`, `flex-grow`, `align-items` | `_layout.scss` |
| Typography | `font-size`, `font-weight`, `font-family` | `_typography.scss` |
| Color / background | `background-color`, `color` using hardcoded hex | `_colors.scss` (replace with `var(--...)`) |
| Form element styling | `input`, `select`, `label` rules | `_forms.scss` |
| Host/container sizing | `:host { display: flex; height: 100% }` | `_layout.scss` |
| Deep/piercing selectors for third-party components | `:host /deep/ angular-editor` | `_vendors.scss` |
| Component-specific unique rules | Rules that only make sense for one component | Stay in a per-component `.scss` file |

### 1.2 Create reusable utility classes for repeated patterns

Across 221 components the same declarations appear repeatedly. Identify the top repeated patterns:

```bash
grep -rh "styles: \[" -A 30 gnomex_ng/src/app --include="*.ts" | sort | uniq -c | sort -rn | head -40
```

Expected repeating patterns (based on audit findings):

```scss
// _layout.scss — add these utility classes
.flex-container-row        { display: flex; flex-direction: row; }
.flex-container-column     { display: flex; flex-direction: column; }
.flex-grow                 { flex-grow: 1; }
.justify-center            { justify-content: center; }
.justify-space-between     { justify-content: space-between; }
.justify-space-evenly      { justify-content: space-evenly; }
.align-items-center        { align-items: center; }
.overflow-auto             { overflow: auto; }
.overflow-hidden           { overflow: hidden; }
.full-height               { height: 100%; }
.full-width                { width: 100%; }
```

### 1.3 Process components in batches by feature folder

Work feature folder by feature folder to keep changes reviewable:

```
src/app/
├── experiments/        ← ~40 components
├── analysis/           ← ~30 components
├── billing/            ← ~20 components
├── configuration/      ← ~20 components
├── util/               ← ~30 components
└── ...
```

For each component:
1. Copy the inline style block content.
2. If the rules are pure utilities (flexbox, sizing) — delete them from the component and add the utility class name to the HTML template instead.
3. If the rules are component-specific — move them to a new `component-name.component.scss` file, remove `styles: [...]`, and add `styleUrls: ['./component-name.component.scss']`.
4. Replace any hardcoded hex colors with the appropriate CSS custom property from `_variables.scss`.

### 1.4 Remove deprecated deep selectors

Every instance of `:host /deep/` and `::ng-deep` (e.g., in `analysis-description-tab.component.ts`) should be moved to `_vendors.scss` without the `:host` prefix, since they need to pierce component encapsulation globally anyway.

```scss
// _vendors.scss
angular-editor #editor                                       { resize: none; }
angular-editor .angular-editor-button[title="Insert Image"] { display: none; }
```

---

## Phase 2 — Eliminate HTML Inline Styles (51 templates, 246 instances)

### 2.1 Classify each inline style occurrence

```bash
grep -rn 'style="' gnomex_ng/src/app --include="*.html"
```

Typical patterns and their resolutions:

| Pattern | Example | Resolution |
|---|---|---|
| Display/visibility toggle | `style="display:none"` | Use `*ngIf` or `[hidden]` |
| Dynamic width/height | `[style.width.px]="someVar"` | Keep — this is an Angular binding, not static CSS |
| Static layout | `style="margin-top: 8px"` | Extract to utility class `.mt-8` in `_layout.scss` |
| Hardcoded colors | `style="color: #cc0000"` | Extract to semantic CSS class (`.text-error`) |
| Flex layout | `style="display: flex; flex: 1"` | Replace with utility class |

### 2.2 Add spacing utility classes to `_layout.scss`

Rather than one-off margin/padding inline styles, add a small set of utilities:

```scss
// _layout.scss — spacing utilities (only values that actually appear in the code)
.mt-4   { margin-top: 4px; }
.mt-8   { margin-top: 8px; }
.mt-16  { margin-top: 16px; }
.mb-4   { margin-bottom: 4px; }
.mb-8   { margin-bottom: 8px; }
.p-8    { padding: 8px; }
.p-16   { padding: 16px; }
```

### 2.3 Never touch dynamic `[style.X]` bindings

Angular template bindings like `[style.width.px]="col.width"` are data-driven and must stay in templates. Only remove literal static `style="..."` attributes.

---

## Phase 3 — Consolidate `tabs.component.css` Hardcoded Colors

`src/app/util/tabs/tabs.component.css` uses hardcoded colors that do not reference the design-system variables.

- Rename to `tabs.component.scss`.
- Map each hardcoded color to its nearest CSS custom property:

| Hardcoded value | Replacement variable |
|---|---|
| `#E6E6E6` | `var(--greywarm-lighter)` |
| `#CCCCCC` | `var(--greywarm-light)` |
| `#7C8080` | `var(--greycool-dark)` |
| `#FFFFFF` | `var(--white)` |

---

## Phase 4 — Increase CSS Custom Property Coverage

Only ~12% of the 345 defined variables are currently used. After Phases 1–3, sweep through all newly-extracted rules and replace remaining hardcoded colors.

### 4.1 Color-mapping quick reference

```
#333333  → var(--grey-darker)
#666666  → var(--grey-medium)
#ccc     → var(--greywarm-lighter)
#f0f0f0  → var(--greywarm-lightest)
red      → var(--red-medium)
```

### 4.2 Grep for remaining hardcoded colors and fix them

```bash
grep -rn "#[0-9a-fA-F]\{3,6\}\|color: [a-z]\+\|background: [a-z]\+" \
  gnomex_ng/src/styles/ gnomex_ng/src/app --include="*.scss"
```

---

## Phase 5 — Migrate the LESS File

`src/app/experiments/browse-experiments-component.less` needs migration:

1. Convert to SCSS syntax (LESS and SCSS are nearly identical for basic rules — rename the file extension and verify).
2. Move layout rules (`.flex-column-container`, `.flex-row-container`) into `_layout.scss` as utility classes.
3. Move the `.sidebar` transition rule into a new `browse-experiments.component.scss`.
4. Replace hardcoded `#ccc` with `var(--greywarm-lighter)`.
5. Delete the `.less` file.

---

## Phase 6 — Consolidate Angular Material Overrides

Currently `styles.css` contains Angular Material overrides mixed with general rules. Move all `mat-*` overrides into `_material.scss`.

```bash
grep -n "\.mat-\|\.cdk-" gnomex_ng/src/styles.css
```

---

## Phase 7 — Verification and Cleanup

### 7.1 Confirm no `styles: [...]` remain in component files

```bash
grep -rn "styles: \[" gnomex_ng/src/app --include="*.ts"
```

Expected result: zero matches.

### 7.2 Confirm no static `style="..."` remain in templates

```bash
grep -rn ' style="[^"]*"' gnomex_ng/src/app --include="*.html" \
  | grep -v '\[style\.' | grep -v 'ngStyle'
```

Expected result: zero or near-zero matches (some may be legitimate third-party widget wrappers).

### 7.3 Build and visual-regression check

```bash
cd gnomex_ng && ng build --configuration production
```

Compare bundle size and visual screenshots against the Phase 0 baseline.

### 7.4 Add stylelint

Add `stylelint` with a config that enforces:
- No hardcoded hex colors — use `no-color-literals` rule (warn on anything not wrapped in `var(--...)`)
- No `!important` except in `_accessibility.scss`
- No `/deep/` or `::ng-deep`

---

## Execution Order and Effort Estimate

| Phase | Work | Est. Effort |
|---|---|---|
| 0 — Preparation & folder structure | Low risk, foundational | 2–3 hours |
| 1 — Extract 221 inline component styles | High volume, low risk per component | 3–5 days |
| 2 — Remove 246 HTML inline styles | Medium risk (template changes) | 1–2 days |
| 3 — Fix tabs.component.css | Trivial | 1 hour |
| 4 — CSS variable coverage sweep | Medium effort | 4–6 hours |
| 5 — LESS file migration | Trivial | 1 hour |
| 6 — Material overrides consolidation | Low risk | 2 hours |
| 7 — Verification & linting setup | Important gate | 2–3 hours |

**Total estimated effort: 6–9 days of focused work** (can be parallelized across feature folders).

---

## Key Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Angular component style encapsulation — global classes may not apply | Set `ViewEncapsulation.None` only where needed, or ensure global classes match existing specificity |
| `/deep/` removal breaks third-party widget styling | Move to `_vendors.scss` as global rules; test each widget after the move |
| Extracting styles breaks a component visually | Keep a per-component `.scss` file for any rule that cannot be safely generalized |
| CSS specificity changes when moving from inline to class | Use the same selector specificity; avoid adding extra nesting |

The safest approach is to migrate one feature folder at a time, build and visually verify after each folder, then commit before proceeding to the next.
