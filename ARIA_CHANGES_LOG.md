# ARIA Accessibility Changes Log

## Date: 2026-02-02
## Folder: gnomex_ng/src/app/experiments

This document tracks all ARIA accessibility improvements made to the experiments folder.

---

## Summary of Changes

| File | Changes Made |
|------|--------------|
| browse-experiments.component.html | Added role="main", role="navigation", role="tree", role="status", aria-labels, aria-hidden for decorative images |
| amend-experiment-overview.component.ts | Added role="main", aria-label for tabs, aria-hidden for icons, role="toolbar" |
| browse-overview/project-browse.component.html | Added role="form", aria-label, aria-required, role="alert" for errors |
| browse-overview/browse-overview.component.ts | Added role="main", role="banner", role="region", aria-labels for tabs |
| browse-overview/experiments-browse.component.ts | Added role="region", role="grid", aria-label |
| browse-overview/progress-browse.component.ts | Added role="region", role="group", role="grid", aria-labels |
| browse-overview/visiblity-browse.component.ts | Added role="region", role="grid", aria-label |
| experiment-detail/experiment-detail-overview.component.html | Added role="main", role="banner", role="toolbar", aria-labels for buttons and tabs |
| experiment-detail/description-tab.component.html | Added role="form", role="group", aria-labelledby, role="alert" for errors |
| experiment-detail/materials-methods-tab.component.html | Added role="region", role="group", aria-labelledby |
| experiment-detail/experiment-bioinformatics-tab.component.html | Added role="region", role="form", role="list", aria-labels for checkboxes |
| experiment-detail/collaborators-dialog.component.html | Added role="dialog", role="group", role="grid", aria-labels |
| experiment-detail/experiment-billing-tab.component.ts | Added role="region", role="toolbar", role="grid", aria-labels |
| experiment-detail/experiment-files-tab.component.ts | Added role="region", role="toolbar", role="grid", role="status", aria-labels |
| new-experiment/new-experiment.component.html | Added role="main", role="banner", role="region", role="toolbar", aria-labels |
| new-experiment/tab-visibility.component.html | Added role="region", role="form", role="group", aria-labelledby, aria-labels for radio buttons |
| new-experiment/tab-samples-illumina.component.html | Added role="region", role="form", role="toolbar", role="grid", aria-labels |
| new-experiment/new-experiment-setup.component.html | Added role="region", role="form", role="list", role="listitem", role="group", aria-labelledby |
| orders/experiment-orders.component.html | Added role="main", role="region", role="grid", role="toolbar", role="status", aria-labels |
| create-project.component.ts | Added role="form", aria-labels, role="alert" for errors |
| delete-project.component.ts | Added role="alertdialog", aria-label |
| delete-experiment.component.ts | Added role="alertdialog", aria-label |
| reassign-experiment.component.ts | Added role="form", aria-labels, aria-required |

---

## Detailed Changes

### 1. browse-experiments.component.html
- Added `role="main"` and `aria-label="Experiments Browser"` to main container
- Added `aria-hidden="true"` to decorative spacer elements
- Added `role="region"` and `aria-label="Experiments content area"` to content section
- Added `role="navigation"` and `aria-label="Experiments tree navigation"` to tree container
- Added `role="alert"` and `aria-live="polite"` to drag-drop hint
- Added `role="status"` and `aria-live="polite"` to experiment count display
- Added `role="tree"` and `aria-label="Experiments hierarchy"` to tree component
- Added `role="treeitem"` with dynamic aria-label to tree nodes
- Added `aria-hidden="true"` to decorative tree node icons
- Added `role="toolbar"` and `aria-label="Tree actions"` to action buttons section
- Added individual `aria-label` attributes to all buttons
- Added `aria-label` to checkbox

### 2. amend-experiment-overview.component.ts
- Added `role="main"` and `aria-label="Amend Experiment"` to main container
- Added `role="heading"` with `aria-level="1"` to title
- Added `aria-hidden="true"` to decorative experiment icon
- Added `aria-label="Experiment amendment steps"` to tab group
- Added `role="toolbar"` and `aria-label="Navigation and actions"` to footer
- Added `role="group"` and `aria-label="Step navigation"` to navigation buttons
- Added `aria-hidden="true"` to mat-icons
- Added `aria-label` to Back, Next, Save, and Cancel buttons
- Added `aria-label` to billing agreement checkbox

### 3. browse-overview/project-browse.component.html
- Added `role="form"` and `aria-label="Project details form"` to form
- Added `aria-label` and `aria-required="true"` to project name input
- Added `role="alert"` to error messages
- Added `id="descEditorLabel"` to description label
- Added `aria-labelledby="descEditorLabel"` to editor
- Added `aria-live="polite"` to max length error

### 4. browse-overview/browse-overview.component.ts
- Added `role="main"` and `aria-label="Browse Overview"` to main container
- Added `role="banner"` to header
- Added `role="heading"` with `aria-level="1"` and `aria-live="polite"` to title
- Added `id="experimentFilterLabel"` and `aria-labelledby` for filter combo
- Added `role="region"` and `aria-label="Experiment tabs"` to tabs container
- Added `aria-label` to each tab group and individual tabs

### 5. browse-overview/experiments-browse.component.ts
- Added `role="region"` and `aria-label="Experiments list"` to container
- Added `role="grid"` and `aria-label="Experiments data grid"` to ag-grid

### 6. browse-overview/progress-browse.component.ts
- Added `role="region"` and `aria-label="Progress tracking"` to container
- Added `role="group"` and `aria-label="Progress filter options"` to filter section
- Added `aria-label="Select progress view type"` to radio group
- Added `role="grid"` and `aria-label="Progress data grid"` to ag-grid

### 7. browse-overview/visiblity-browse.component.ts
- Added `role="region"` and `aria-label="Visibility settings"` to container
- Added `role="grid"` and `aria-label="Visibility data grid"` to ag-grid

### 8. experiment-detail/experiment-detail-overview.component.html
- Added `role="main"` and `aria-label="Experiment Detail Overview"` to main container
- Added `role="banner"` to header row
- Added `role="heading"` with `aria-level="1"` to title
- Added `aria-hidden="true"` to all decorative button icons
- Added `role="toolbar"` and `aria-label="Experiment actions"` to action buttons
- Added `aria-label` to Edit/View, Download Files, Print Experiment Order, Create New Analysis, Share URL, and Contact Core buttons
- Added `role="region"` and `aria-label="Experiment tabs content"` to tabs container
- Added `aria-label="Experiment detail tabs"` to tab group
- Added `aria-label` to each individual tab

### 9. experiment-detail/description-tab.component.html
- Added `role="form"` and `aria-label="Experiment description form"` to form
- Added `role="group"` with appropriate aria-labels to each field section
- Added `id` attributes to labels and `aria-labelledby` to inputs/editors
- Added `aria-required="false"` to experiment name input
- Added `role="alert"` and `aria-live="polite"` to error messages

### 10. experiment-detail/materials-methods-tab.component.html
- Added `role="region"` and `aria-label="Materials and Methods"` to main container
- Added `role="group"` and `aria-labelledby` to Name and Experiment fields
- Added `role="region"` and `aria-label="Protocols"` to protocols section
- Added dynamic `aria-label` to protocol buttons

### 11. experiment-detail/experiment-bioinformatics-tab.component.html
- Added `role="region"` and `aria-label="Bioinformatics Settings"` to main container
- Added `role="region"` and `aria-label="Bioinformatics Summary"` to summary section
- Added `role="group"` and `aria-labelledby` to compression field
- Added `aria-label` to textarea fields
- Added `role="form"` and `aria-label="Bioinformatics Options"` to options form
- Added `role="heading"` with `aria-level="2"` to header
- Added `role="list"` and `aria-label` to configuration options
- Added `aria-label` to all checkboxes

### 12. experiment-detail/collaborators-dialog.component.html
- Added `role="dialog"` and `aria-label="Manage Collaborators"` to dialog container
- Added `role="group"` and `aria-label="Add collaborator"` to add section
- Added `aria-label="Select collaborator to add"` to combo box
- Added `aria-label="Add selected collaborator"` to Add button
- Added `aria-hidden="true"` to button icons
- Added `role="region"` and `aria-label="Current collaborators"` to grid section
- Added `role="grid"` and `aria-label="Collaborators list"` to ag-grid

### 13. experiment-detail/experiment-billing-tab.component.ts
- Added `role="region"` and `aria-label="Billing Information"` to main container
- Added `role="toolbar"` and `aria-label="Billing actions"` to actions section
- Added `aria-label="Edit billing template"` to button
- Added `aria-live="polite"` to current accounts label
- Added `aria-hidden="true"` to decorative elements
- Added `role="grid"` and `aria-label="Billing items grid"` to ag-grid

### 14. experiment-detail/experiment-files-tab.component.ts
- Added `role="region"` and `aria-label="Experiment Files"` to main container
- Added `role="toolbar"` and `aria-label="File actions"` to buttons section
- Added `aria-label` to all file action buttons
- Added `aria-hidden="true"` to all button icons
- Added `role="grid"` and `aria-label="Files data grid"` to ag-grid
- Added `role="status"` and `aria-live="polite"` to file count display

### 15. new-experiment/new-experiment.component.html
- Added `role="main"` and `aria-label="New Experiment Wizard"` to main container
- Added `role="banner"` to header section
- Added `aria-hidden="true"` to decorative icon
- Added `role="heading"` with `aria-level="1"` to label
- Added `role="region"` and `aria-label="Experiment setup steps"` to tabs container
- Added `aria-label="New experiment steps"` to tab group
- Added `aria-label="Initial setup step"` to Setup tab
- Added `role="toolbar"` and `aria-label="Wizard navigation"` to navigation section
- Added `aria-hidden="true"` to mat-icons
- Added `aria-label` to Back, Next, Submit/Save, and Cancel buttons
- Added `aria-label` to agreement checkbox

### 16. new-experiment/tab-visibility.component.html
- Added `role="region"` and `aria-label="Visibility Settings"` to main container
- Added `role="form"` and `aria-label="Visibility form"` to form
- Added `role="group"` and `aria-label="Base visibility level"` to visibility selection
- Added `id="visibilityLabel"` and `aria-labelledby` to radio group
- Added `aria-hidden="true"` to decorative radio button icons
- Added `aria-label="Privacy expiration date"` to date input
- Added `aria-label="Open date picker"` to date picker toggle
- Added `role="region"` and `aria-label="Collaborators section"` to collaborators section
- Added `role="grid"` and `aria-label="Collaborators grid"` to ag-grid

### 17. new-experiment/tab-samples-illumina.component.html
- Added `role="region"` and `aria-label="Samples Configuration"` to main container
- Added `role="form"` and `aria-label="Samples form"` to form
- Added `role="toolbar"` and `aria-label="Sample actions"` to toolbar section
- Added `role="group"` and `aria-label="Add or remove samples"` to sample buttons
- Added `aria-label` to Add sample, Remove samples, Upload Sample Sheet, Download Sample Sheet buttons
- Added `aria-hidden="true"` to all button icons
- Added `aria-label` to Enter CC Numbers checkbox
- Added `aria-label="File input for sample sheet"` to file input
- Added `role="grid"` and `aria-label="Samples data grid"` to ag-grid

### 18. new-experiment/new-experiment-setup.component.html
- Added `role="region"` and `aria-label="Experiment Setup"` to main container
- Added `role="form"` and `aria-label="Experiment setup form"` to form
- Added `role="list"` and `aria-label="Setup steps"` to ordered list
- Added `role="listitem"` to each list item
- Added `role="group"` with appropriate aria-labels to each section
- Added `id` attributes to labels and `aria-labelledby` to form controls
- Added `aria-hidden="true"` to decorative category icons
- Added `aria-label` to link buttons (Edit, New, Split Billing, etc.)
- Added `role="alert"` to error messages

### 19. orders/experiment-orders.component.html
- Added `role="main"` and `aria-label="Experiment Orders"` to main container
- Added `aria-hidden="true"` to decorative spacer
- Added `role="region"` and `aria-label="Orders list"` to orders section
- Added `role="grid"` and `aria-label="Orders data grid"` to ag-grid
- Added `role="toolbar"` and `aria-label="Order actions"` to footer actions
- Added `role="status"` and `aria-live="polite"` to selection count and order count
- Added `aria-label="Change status dropdown"` to status dropdown
- Added `aria-label` to Go, Delete, and Email buttons
- Added `aria-hidden="true"` to all button icons

### 20. create-project.component.ts
- Added `role="form"` and `aria-label="Create or edit project"` to form container
- Added `aria-label="Select lab"` to lab combo box
- Added `aria-label="Project name"` and `aria-required="true"` to name input
- Added `role="alert"` to error messages
- Added `id="descEditorLabel"` to description label
- Added `aria-labelledby="descEditorLabel"` to editor
- Added `aria-live="polite"` to max length error

### 21. delete-project.component.ts
- Added `role="alertdialog"` and `aria-label="Confirm project deletion"` to dialog

### 22. delete-experiment.component.ts
- Added `role="alertdialog"` and `aria-label="Confirm experiment deletion"` to dialog

### 23. reassign-experiment.component.ts
- Added `role="form"` and `aria-label="Reassign experiment form"` to form
- Added `id="reassignDescription"` to description paragraph
- Added `aria-label="Select new owner"` and `aria-required="true"` to owner combo box
- Added `aria-label="Select billing account"` and `aria-required="true"` to account combo box

---

## ARIA Attributes Used

| Attribute | Purpose |
|-----------|---------|
| `role="main"` | Identifies main content area |
| `role="navigation"` | Identifies navigation sections |
| `role="banner"` | Identifies header/banner sections |
| `role="region"` | Identifies distinct content regions |
| `role="toolbar"` | Identifies groups of action buttons |
| `role="group"` | Groups related form fields |
| `role="form"` | Identifies form elements |
| `role="grid"` | Identifies data grids (ag-grid) |
| `role="tree"` | Identifies tree structures |
| `role="treeitem"` | Identifies tree nodes |
| `role="list"` | Identifies ordered/unordered lists |
| `role="listitem"` | Identifies list items |
| `role="status"` | Identifies live status updates |
| `role="alert"` | Identifies error messages |
| `role="alertdialog"` | Identifies confirmation dialogs |
| `role="dialog"` | Identifies dialog windows |
| `role="heading"` | Identifies headings (with aria-level) |
| `role="progressbar"` | Identifies progress indicators |
| `aria-label` | Provides accessible name |
| `aria-labelledby` | References label element |
| `aria-describedby` | References description element |
| `aria-hidden="true"` | Hides decorative elements from screen readers |
| `aria-live="polite"` | Announces dynamic content changes |
| `aria-required="true"` | Indicates required form fields |
| `aria-level` | Indicates heading level |
| `aria-current="step"` | Indicates current step in workflow |
| `aria-valuenow/valuemax` | Progress bar values |

---

## Notes

- All decorative images (icons in buttons) now have `alt=""` and `aria-hidden="true"` to prevent screen reader confusion
- Form error messages now use `role="alert"` for immediate announcement
- Dynamic content areas use `aria-live="polite"` for non-intrusive updates
- All interactive elements have descriptive `aria-label` attributes
- Data grids (ag-grid components) have been annotated with `role="grid"` and descriptive labels
