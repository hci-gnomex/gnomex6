# ARIA Accessibility Changes — `app/topics`

**Date:** 2026-03-03
**Files modified:** 2

---

## browse-topics.component.html

### 1. Layout spacer hidden from assistive technology
- **Element:** `<div class="full-width vertical-spacer background">`
- **Change:** Added `aria-hidden="true"`
- **Reason:** Pure layout spacer with no content; prevents screen readers from announcing an empty element.

### 2. Topics tree panel landmark
- **Element:** `<div class="full-height full-width flex-container-col foreground">` (left split panel)
- **Change:** Added `role="region" aria-label="Topics tree"`
- **Reason:** Identifies the left panel as a named landmark region so screen reader users can navigate to it directly.

### 3. Topics tree accessible name
- **Element:** `<tree-root #topicsTree ...>`
- **Change:** Added `aria-label="Topics"`
- **Reason:** The tree component had no accessible name, so screen readers could not announce what tree was being navigated.

### 4. Topic details panel landmark
- **Element:** `<div class="full-width full-height border padded small-font">` (right split panel)
- **Change:** Added `role="region" aria-label="Topic details"`
- **Reason:** Identifies the right panel as a named landmark region.

### 5. View mode radio group label
- **Element:** `<mat-radio-group (change)="this.onModeChange()" [(ngModel)]="this.mode">`
- **Change:** Added `aria-label="View mode"`
- **Reason:** `mat-radio-group` had no accessible label; screen readers could not announce the purpose of the Experiment / Analysis / Data Track radio buttons.

### 6. Filter by Lab combo-box label
- **Element:** `<custom-combo-box placeholder="Filter by Lab" ...>`
- **Change:** Added `aria-label="Filter by Lab"`
- **Reason:** `placeholder` is not a reliable accessible name for custom components; an explicit `aria-label` ensures the label is announced correctly.

### 7. Organism combo-box label
- **Element:** `<custom-combo-box placeholder="Organism" ...>` (conditional, Data Track mode)
- **Change:** Added `aria-label="Organism"`
- **Reason:** Same as above — explicit label required for custom combo-box.

### 8. Genome Build combo-box label
- **Element:** `<custom-combo-box placeholder="Genome Build" ...>` (conditional, Data Track + organism selected)
- **Change:** Added `aria-label="Genome Build"`
- **Reason:** Same as above — explicit label required for custom combo-box.

### 9. Icon-only "Clear search" button label
- **Element:** `<button mat-button class="minimize" [hidden]="!searchText" (click)="clearSearchText()">`
- **Change:** Added `aria-label="Clear search"`
- **Reason:** Button contained only a cancel icon image with `alt=""`; without an `aria-label` the button had no accessible name and would be announced as an unlabelled button.

### 10. Icon-only "Search" button label
- **Element:** `<button mat-button class="minimize" (click)="searchByText()">`
- **Change:** Added `aria-label="Search by name"`
- **Reason:** Button contained only a magnifier icon image with `alt=""`; same issue as the clear button above.

### 11. Time frame radio group label
- **Element:** `<mat-radio-group ... [(ngModel)]="this.selectedTimeFrame">` (conditional, Experiment / Analysis mode)
- **Change:** Added `aria-label="Time frame"`
- **Reason:** Radio group had no accessible label; the time-frame options (e.g. 1 month, 6 months) were not associated with any group description.

### 12. Data tree accessible name
- **Element:** `<tree-root #dataTree ...>`
- **Change:** Added `aria-label="Available items to drag to topic"`
- **Reason:** The data tree had no accessible name. The label conveys both the purpose of the tree and the expected drag-and-drop interaction.

---

## topics-detail.component.html

### 1. Topic icon image alt text
- **Element:** `<img [src]="this.constService.ICON_TOPIC" class="icon">`
- **Change:** Added `alt=""`
- **Reason:** Image had no `alt` attribute at all. Since the adjacent text already describes the topic, the image is decorative and should be suppressed with `alt=""`.

### 2. Share URL button icon alt text
- **Element:** `<img [src]="this.constService.GLOBE_LINK" class="icon">` (inside Share URL button)
- **Change:** Added `alt=""`
- **Reason:** Button text "Share URL" already provides the accessible name; the icon is decorative and must have `alt=""` to avoid redundant or confusing announcements.

### 3. Email topic owner button icon alt text
- **Element:** `<img [src]="this.constService.EMAIL_GO_LINK" class="icon">` (inside Email topic owner button)
- **Change:** Added `alt=""`
- **Reason:** Same as above — button text provides the name; icon is decorative.

### 4. Tab group accessible name
- **Element:** `<mat-tab-group class="mat-tab-group-border full-height">`
- **Change:** Added `aria-label="Topic details"`
- **Reason:** Without a label, screen readers announce the tab group generically. The label helps users understand which set of tabs they are interacting with.

### 5. Lab combo-box label (form enabled state)
- **Element:** `<custom-combo-box placeholder="Lab" ...>`
- **Change:** Added `aria-label="Lab"`
- **Reason:** `placeholder` is not a reliable accessible name for custom components.

### 6. Owner combo-box label (form enabled state)
- **Element:** `<custom-combo-box placeholder="Owner" ...>`
- **Change:** Added `aria-label="Owner"`
- **Reason:** Same as above — explicit label required for custom combo-box.

### 7. Rich-text editor (Description) label
- **Element:** `<angular-editor formControlName="description" ...>`
- **Change:** Added a visually-hidden `<label id="descriptionLabel">Description</label>` immediately before the editor, and `aria-labelledby="descriptionLabel"` on the editor component.
- **Reason:** The rich-text editor had no visible or programmatic label; screen readers had no way to announce what field the editor represented.

### 8. Visibility radio group label
- **Element:** `<mat-radio-group class="flexbox-column" formControlName="codeVisibility">`
- **Change:** Added `aria-label="Visibility"`
- **Reason:** Radio group had no accessible group label; the visibility options (Institution, Members, Public, etc.) were not announced with any context.

### 9. Visibility radio button icon alt text
- **Element:** `<img [src]="rad.icon" class="icon">` (inside each `*ngFor` radio button)
- **Change:** Added `alt=""`
- **Reason:** Each icon image had no `alt` attribute. Since the adjacent `{{rad.display}}` text already names the option, the icons are decorative and should be suppressed.

---

## Summary of ARIA patterns applied

| Pattern | Count |
|---|---|
| `aria-hidden="true"` on layout/decorative elements | 1 |
| `role="region"` + `aria-label` on landmark panels | 3 |
| `aria-label` on tree components | 2 |
| `aria-label` on `mat-radio-group` | 3 |
| `aria-label` on `custom-combo-box` | 5 |
| `aria-label` on icon-only buttons | 2 |
| `aria-label` on `mat-tab-group` | 1 |
| `alt=""` on decorative images | 4 |
| `aria-labelledby` on rich-text editor | 1 |
| **Total changes** | **22** |
