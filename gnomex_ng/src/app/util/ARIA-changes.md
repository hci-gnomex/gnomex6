# ARIA Changes Log — `gnomex_ng/src/app/util`

Date: 2026-03-04
Branch: ng8-aria-fixes

## Summary

All components under `gnomex_ng/src/app/util` were reviewed for ARIA compliance. Files that already had adequate ARIA were left unchanged. The following files required additions or corrections.

---

## Files Already Containing Sufficient ARIA (No Changes Needed)

| File | Notes |
|------|-------|
| `annotation-tab.component.html` | `role="region"`, `role="group"`, `aria-label`, `role="alert"`, `aria-labelledby` on all inputs |
| `basic-email-dialog.component.html` | `role="dialog"`, `aria-label`, `role="alert"` on errors |
| `billing-period-selector.component.ts` | `role="group"`, `aria-labelledby`, `aria-label` on button |
| `billing-period-selector-popup.component.ts` | `role="dialog"`, `aria-labelledby`, `aria-live`, `aria-label` on all buttons |
| `billing-template-window.component.html` | `role="toolbar"`, `role="region"`, `aria-label`, `aria-labelledby`, `aria-live` |
| `billing-usage-report.component.ts` | `role="group"`, `aria-label`, `role="radiogroup"` |
| `browse-filter.component.html` | `role="search"`, `role="radiogroup"`, `role="group"`, `aria-label`, `aria-labelledby`, `aria-expanded` |
| `context-help.component.ts` | `aria-label` on button |
| `context-help-popup.component.ts` | `role="dialog"`, `role="region"`, `aria-label` on all inputs |
| `custom-combo-box.component.ts` | `role="combobox"`, `aria-haspopup`, `aria-expanded`, `aria-label`, `role="alert"` |
| `custom-multi-combo-box.component.ts` | `role="group"`, `role="combobox"`, `aria-haspopup`, `aria-expanded`, `aria-label` |
| `date-picker.component.html` | `aria-label`, `aria-required`, `role="alert"` |
| `date-range-filter.component.html` | `aria-label`, `aria-haspopup` on all buttons and menus |
| `date-range-filter-popup.component.html` | `role="region"`, `role="group"`, `aria-label`, `aria-labelledby` |
| `download-files.component.ts` | `role="dialog"`, `role="region"`, `role="tree"`, `role="treeitem"`, `role="status"`, `aria-live`, `aria-label` |
| `download-picker.component.ts` | `role="dialog"`, `role="region"`, `role="group"`, `aria-label` |
| `download-progress.component.ts` | `role="dialog"`, `role="progressbar"`, `aria-valuenow/min/max`, `aria-label` |
| `edit-institutions.component.ts` | `role="dialog"`, `role="toolbar"`, `role="region"`, `aria-label` |
| `emailRelatedUsersPopup/email-related-users-popup.component.ts` | `role="dialog"`, `aria-label`, `aria-required`, `aria-labelledby` |
| `generic-container-dialog.component.html` | `role="dialog"`, `role="region"`, `role="group"`, `aria-label`, `aria-hidden` |
| `grid-editors/multi-select.editor.html` | `role="gridcell"`, `aria-label` |
| `grid-editors/select.editor.html` | `role="gridcell"`, `aria-label` on select and fill button |
| `grid-editors/text-select-xor-multiselect.editor.html` | `role="gridcell"`, `aria-label` |
| `grid-editors/url-annot.editor.html` | `role="gridcell"`, `aria-label` |
| `grid-editors/numeric-editor.component.ts` | `aria-label`, `role="spinbutton"` |
| `grid-editors/popups/multiple-select-dialog.component.html` | `role="dialog"`, `aria-labelledby`, `role="region"`, `role="group"`, `aria-label` |
| `grid-editors/popups/url-annot-dialog.component.html` | `role="dialog"`, `role="group"`, `aria-label` |
| `grid-renderers/checkbox.renderer.ts` | `aria-checked`, `aria-label` |
| `grid-renderers/text-select-xor-multiselect.renderer.html` | `role="gridcell"`, `role="button"`, `tabindex`, `aria-label`, keyboard event handlers |
| `guest-terms-dialog.component.ts` | `role="dialog"`, `role="document"`, `aria-label`, `aria-required`, `aria-describedby` |
| `menuHeaders/menu-header-billing.component.html` | `role="toolbar"`, `aria-label`, `aria-haspopup` |
| `menuHeaders/menu-header-data-tracks.component.html` | `role="toolbar"`, `aria-label` |
| `menuHeaders/menu-header-topics.component.ts` | `role="toolbar"`, `aria-label` |
| `new-genome-build.component.ts` | `role="form"`, `aria-label`, `aria-required` |
| `new-organism.component.ts` | `role="form"`, `aria-label`, `aria-required`, `role="alert"` |
| `new-topic.component.html` | `role="dialog"`, `aria-label`, `aria-required`, `role="alert"` |
| `pickers/month-picker.component.html` | `role="group"`, `aria-label` |
| `popup/alert-dialog.component.ts` | `role="alertdialog"`, `aria-labelledby`, `aria-describedby`, `role="alert"`, `aria-live` |
| `popup/generic-container-dialog.component.html` | `role="dialog"`, `role="region"`, `role="group"`, `aria-label` |
| `popup/spinner-dialog.component.html` | `role="alert"`, `aria-live`, `aria-busy`, `aria-label` |
| `related-data-tab.component.ts` | `role="region"`, `role="tree"`, `role="treeitem"`, `aria-label` |
| `save-footer.component.ts` | `role="region"`, `role="alert"`, `aria-live`, `aria-label` |
| `share-link-dialog.component.ts` | `role="dialog"`, `aria-label`, `aria-readonly` |
| `tabs/tab-container.component.html` | `role="heading"`, `aria-level` |
| `upload/linked-sample-file.component.html` | `role="region"`, `role="toolbar"`, `role="tree"`, `role="treeitem"`, `aria-label` |
| `upload/organize-files.component.html` | `role="region"`, `role="toolbar"`, `role="tree"`, `role="treeitem"`, `aria-label`, `aria-labelledby` |
| `upload/upload-file.component.html` | `role="dialog"`, `role="toolbar"`, `role="region"`, `role="group"`, `aria-label`, `aria-valuenow/min/max` |
| `url-annotation.component.html` | `role="group"`, `role="listitem"`, `role="group"`, `aria-label` |

---

## Files Modified

### `configure-annotations.component.html`

**Changes:**
- Added `id="configure-annotations-heading"` and `alt="" aria-hidden="true"` to heading label's icon image
- Added `aria-label` to **Add**, **Remove**, and **Refresh** buttons; added `alt="" aria-hidden="true"` to their icon images
- Added `id="show-annotations-for-label"` to "Show Annotations For" label; added `aria-labelledby` to its `mat-radio-group`
- Added `aria-label` to the three filter combo boxes (Organism, Experiment Platform, Analysis Type)
- Added `aria-label="Annotations list"` to the annotations `ag-grid-angular`
- Added `aria-label="Annotation configuration"` to the `mat-tab-group`
- Added `aria-label="Annotation name"` and `aria-required="true"` to the Name input; added `role="alert"` to its error
- Added `aria-label="Active"` to the Active `mat-checkbox`
- Added `id="annotates-label"` to the Annotates label; added `aria-label` to each Annotates checkbox (Sample, Data Track, Analysis, Experiment)
- Added `aria-label="Required annotation"` to the Required `mat-checkbox`
- Added `aria-label="Sort order"` to Sort Order input; added `role="alert"` to its error
- Added `aria-label="Annotation description"` to Description textarea; added `role="alert"` to its error
- Added `aria-label="Annotation owner"` to the Owner combo box
- Added `id="annotation-type-label"` to Type label; added `aria-labelledby` to Type `mat-radio-group`
- Added `aria-label` and `aria-hidden` to **Add option** and **Delete option** buttons and their icons
- Added `aria-label="Annotation options"` to options `ag-grid-angular`
- Added `aria-label` to Platform, Experiment Type combo boxes; `aria-label` + `aria-hidden` to their add/delete buttons
- Added `aria-label="Platforms list"` to platforms `ag-grid-angular`
- Added `aria-label` to Organism combo box; `aria-label` + `aria-hidden` to its add/delete buttons
- Added `aria-label="Organisms list"` to organisms `ag-grid-angular`
- Added `aria-label` to Analysis Type combo box; `aria-label` + `aria-hidden` to its add/delete buttons
- Added `aria-label="Analysis types list"` to analysis types `ag-grid-angular`
- Added `aria-label` to User combo box; `aria-label` + `aria-hidden` to its add/delete buttons
- Added `aria-label="Users list"` to users `ag-grid-angular`
- Added `aria-label="Mage ontology code"` and `aria-label="Mage ontology definition"` to Mage Ontology inputs

---

### `visibility-detail-tab.component.ts`

**Changes:**
- Added `aria-label="Visibility settings"` to the `<form>`
- Added `id="visibility-level-label"` to the visibility level `<label>`
- Added `aria-labelledby="visibility-level-label"` to the `mat-radio-group`
- Added `[attr.aria-label]="rad.display + ': ' + rad.tooltip"` to each `mat-radio-button`; added `alt="" aria-hidden="true"` to the icon image
- Added `aria-label="Privacy expiration date"` to the privacy expiration input
- Added `aria-label="Open privacy expiration date picker"` to `mat-datepicker-toggle`
- Added `id="collaborators-label"` to the collaborators `<label>`
- Added `aria-labelledby="collaborators-label"` to the Collaborators combo box
- Added `aria-label="Add collaborator"` to the add button; added `alt="" aria-hidden="true"` to its icon
- Added `aria-label="Remove selected collaborator"` to the remove button; added `alt="" aria-hidden="true"` to its icon
- Added `aria-label="Collaborators grid"` to the collaborators `ag-grid-angular`

---

### `tabs/tabs.component.ts`

**Changes:**
- Added `role="tablist"` and `aria-label="Navigation tabs"` to the `<ul>` element
- Added `role="tab"`, `[attr.aria-selected]`, `[attr.aria-disabled]`, `[attr.aria-label]`, and `[attr.tabindex]` to each `<li>` element
- Added `aria-hidden="true"` to the `<a>` link inside each tab item (the `<li>` itself is now the accessible element)

---

### `grid-renderers/icon-renderer.component.ts`

**Changes:**
- Added `role="gridcell"` and `aria-label="Icon"` to the container `<div>`
- Added `aria-hidden="true"` to the `<img>` (decorative icon within a grid cell)
