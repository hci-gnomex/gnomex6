# ARIA Configuration Section Fixes

**Branch:** `ng8-aria-fixes`
**Files changed:** 8

---

## Problems Addressed

Configuration views had several recurring ARIA deficiencies that prevented assistive technologies from correctly labelling interactive regions:

1. **Forms without accessible names** — `<form>` elements had no `aria-label`, so screen readers announced them as anonymous regions.
2. **Checkboxes with visually-separate labels** — Many forms used a pattern of `<label>…</label>` next to `<mat-checkbox>`, but without a `for`/`id` link or text content inside the checkbox element. Angular Material's internal label only captures text placed *inside* `<mat-checkbox>`. The external `<label>` was read as unrelated text.
3. **Radio groups without programmatic labels** — `<mat-radio-group>` elements relied on a nearby `<label>` element that was not programmatically associated, leaving the group unlabelled for AT.
4. **AG-Grid elements without accessible names** — `<ag-grid-angular>` components had no `aria-label`, so screen readers could not identify what each grid contained.
5. **Decorative `<img>` elements inside buttons missing `alt=""`** — Buttons that combined an icon image with visible text left the image unlabelled, causing some screen readers to announce the image src path.
6. **`<angular-editor>` without an accessible label** — The rich-text editor in the core facility form had no `aria-label` or associated `<label>`.
7. **Checkbox group without a group role** — The "Experiment Platform Compatibility" checkbox list had no `role="group"` + `aria-labelledby`, so AT could not convey the group heading.

---

## Changes by File

### `config-core-facility-edit.component.html`

| What | Change |
|---|---|
| `<form>` | Added `aria-label="Core Facility Configuration"` |
| `<angular-editor>` | Added `aria-label="Core facility description"` |

### `configure-organisms.component.html`

| What | Change |
|---|---|
| Add/Remove organism buttons | Added `alt=""` to decorative `<img>` elements |
| Add/Remove genome build buttons | Added `alt=""` to decorative `<img>` elements |
| Save organism button | Added `alt=""` to decorative `<img>` |
| Organism `<ag-grid-angular>` | Added `aria-label="Organisms"` |
| Genome Build `<ag-grid-angular>` | Added `aria-label="Genome Builds"` |

### `edit-protocol.component.html`

| What | Change |
|---|---|
| `<form>` | Added `aria-label="Edit Protocol"` |
| Active `<mat-checkbox>` | Added `aria-label="Active"`; added `aria-hidden="true"` to adjacent `<label>` to prevent double-announcement |
| Save button `<img>` | Added `alt=""` |

### `manage-protocols.component.html`

| What | Change |
|---|---|
| Protocol tree pane `<div>` | Added `role="region"` and `aria-label="Protocols"`; added `aria-hidden="true"` to the decorative heading `<div>` |

### `experiment-platform-overview.component.html`

| What | Change |
|---|---|
| `<ag-grid-angular>` | Added `aria-label="Experiment Platforms"` |
| Add/Remove Platform buttons | Added `alt=""` to `<img>` elements |
| Refresh button | Added `alt=""` to `<img>` |

### `experiment-platform-tab.component.html`

| What | Change |
|---|---|
| `<form>` | Added `aria-label="Experiment Platform"` |
| Active checkbox | Added `aria-label="Active"`; `aria-hidden="true"` on adjacent `<label>` |
| Associated With Analysis checkbox | Added `aria-label="Associated With Analysis"`; `aria-hidden="true"` on adjacent `<label>` |
| Require Name & Description checkbox | Added `aria-label="Require Name and Description"`; `aria-hidden="true"` on adjacent `<label>` |
| isInternal checkbox | Added `aria-label="Available for Internal Experiment Orders"`; `aria-hidden="true"` on adjacent `<label>` |
| isExternal checkbox | Added `aria-label="Available for Upload of Experiment Data Generated at a Third Party Facility"`; `aria-hidden="true"` on adjacent `<label>` |
| Use Products checkbox | Added `aria-label="Use Products"`; `aria-hidden="true"` on adjacent `<label>` |
| saveAndSubmit checkbox | Added `aria-label="Allow saving of request before submission"`; `aria-hidden="true"` on adjacent `<label>` |
| Icon preview `<img>` (in mat-form-field) | Added `alt=""` |
| Icon option `<img>` (in mat-option) | Added `alt=""` |

### `ep-experiment-type-tab.component.html`

| What | Change |
|---|---|
| Add/Remove buttons | Added `alt=""` to `<img>` elements |
| `<ag-grid-angular>` | Added `aria-label="Library Prep Types"` |

### `illumina-seq-dialog.component.html`

| What | Change |
|---|---|
| `<form>` | Added `aria-label="Illumina Sequencing Type"` |

### `library-prep-dialog.component.html`

| What | Change |
|---|---|
| `<form>` | Added `aria-label="Library Prep Protocol"` |
| `<mat-radio-group>` | Added `aria-label="Availability"` |
| Experiment Platform Compatibility `<div>` | Added `role="group"` and `aria-labelledby="ep-compat-label"`; added `id="ep-compat-label"` to the heading `<label>` |

---

## Pattern Applied: Checkbox + External Label

Angular Material's `<mat-checkbox>` only generates an internal label from its text **content**. When the visible label is a sibling `<label>` element (not content), the association is not communicated to AT.

**Before (inaccessible):**
```html
<label> Active </label>
<mat-checkbox formControlName="isActive"> </mat-checkbox>
```

**After:**
```html
<label aria-hidden="true"> Active </label>
<mat-checkbox formControlName="isActive" aria-label="Active"> </mat-checkbox>
```

`aria-hidden="true"` on the visible `<label>` prevents the text from being announced twice (once from the label, once from the checkbox's `aria-label`).
