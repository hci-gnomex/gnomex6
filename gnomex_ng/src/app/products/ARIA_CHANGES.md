# ARIA Accessibility Changes — `app/products`

**Date:** 2026-03-03
**Files modified:** 6

---

## configure-product-types.component.html

### 1. Add/Remove button icon alt text
- **Elements:** `<img class="icon" [src]="'./assets/page_add.png'">` and `<img class="icon" [src]="'./assets/page_remove.png'">`
- **Change:** Added `alt=""` to both images
- **Reason:** Button text ("Add Product Type", "Remove Product Type") already provides the accessible name; the icons are decorative and must have `alt=""` to avoid redundant announcements.

### 2. Product types tree accessible name
- **Element:** `<tree-root #tree ...>`
- **Change:** Added `aria-label="Product types"`
- **Reason:** The tree component had no accessible name; screen readers could not announce what was being navigated.

### 3. Product type detail form accessible name
- **Element:** `<form [formGroup]="this.form" ...>`
- **Change:** Added `aria-label="Product type details"`
- **Reason:** The form had no accessible name to orient screen reader users to its purpose.

### 4. Core Facility combo-box label
- **Element:** `<custom-combo-box placeholder="General - Core Facility" ...>`
- **Change:** Added `aria-label="Core Facility"`
- **Reason:** `placeholder` is not a reliable accessible name for custom components.

### 5. Vendor combo-box label
- **Element:** `<custom-combo-box placeholder="General - Vendor" ...>`
- **Change:** Added `aria-label="Vendor"`
- **Reason:** Same as above.

### 6. Price Category combo-box label
- **Element:** `<custom-combo-box placeholder="Price Category" ...>`
- **Change:** Added `aria-label="Price Category"`
- **Reason:** Same as above.

---

## configure-products.component.html

### 1. Add/Remove button icon alt text
- **Elements:** `<img class="icon" [src]="'./assets/page_add.png'">` and `<img class="icon" [src]="'./assets/page_remove.png'">`
- **Change:** Added `alt=""` to both images
- **Reason:** Button text already names the action; icons are decorative.

### 2. Products tree accessible name
- **Element:** `<tree-root #tree ...>`
- **Change:** Added `aria-label="Products"`
- **Reason:** Tree component had no accessible name.

### 3. Product detail form accessible name
- **Element:** `<form [formGroup]="this.productForm" ...>`
- **Change:** Added `aria-label="Product details"`
- **Reason:** The form had no accessible name.

### 4. Product Type combo-box label
- **Element:** `<custom-combo-box placeholder="Product Type" ...>`
- **Change:** Added `aria-label="Product Type"`
- **Reason:** `placeholder` is not a reliable accessible name for custom components.

### 5. Save button icon alt text
- **Element:** `<img class="icon" [src]="'./assets/action_save.gif'">` (inside Save button)
- **Change:** Added `alt=""`
- **Reason:** Button text "Save" already names the action; icon is decorative.

---

## order-products.component.html

### 1. Lab group combo-box label
- **Element:** `<custom-combo-box placeholder="Verify your lab group" ...>`
- **Change:** Added `aria-label="Lab group"`
- **Reason:** `placeholder` is not a reliable accessible name for custom components.

### 2. User name combo-box label
- **Element:** `<custom-combo-box placeholder="Verify your name" ...>`
- **Change:** Added `aria-label="Your name"`
- **Reason:** Same as above.

### 3. Billing account combo-box label
- **Element:** `<custom-combo-box placeholder="Select a billing account" ...>`
- **Change:** Added `aria-label="Billing account"`
- **Reason:** Same as above.

### 4. Product order table accessible name
- **Element:** `<table ...>`
- **Change:** Added `aria-label="Product order items"`
- **Reason:** The table had no caption or label; screen readers could not announce the table's purpose before reading its contents.

### 5. Product description info icon
- **Element:** `<img class="description-icon" *ngIf="p.description" [src]="'./assets/white_information.png'" matTooltip="{{p.description}}">`
- **Change:** Added `role="img"` and `[attr.aria-label]="p.description"`
- **Reason:** The `matTooltip` is mouse-hover only and not exposed to assistive technology. Adding `aria-label` with the description text makes the product description available to screen reader users.

### 6. Quantity input accessible label
- **Element:** `<input matInput ... type="number" [(ngModel)]="p.quantity" ...>`
- **Change:** Added `[attr.aria-label]="'Quantity for ' + p.name"`
- **Reason:** The input had no label; screen readers could not announce which product's quantity was being entered. The dynamic label associates the input with the product row.

### 7. Submit button icon alt text
- **Element:** `<img [src]="'./assets/save.png'" class="icon">` (inside Submit button)
- **Change:** Added `alt=""`
- **Reason:** Button text "Submit" already names the action; icon is decorative.

---

## product-ledger.component.html

### 1. Header basket icon alt text
- **Element:** `<img [src]="'./assets/basket.png'" class="icon">` (inside label)
- **Change:** Added `alt=""`
- **Reason:** The label text "Product Ledgers" already names the section; the icon is decorative.

### 2. Lab combo-box label
- **Element:** `<custom-combo-box placeholder="Lab" ...>`
- **Change:** Added `aria-label="Lab"`
- **Reason:** `placeholder` is not a reliable accessible name for custom components.

### 3. Product combo-box label
- **Element:** `<custom-combo-box placeholder="Product" ...>`
- **Change:** Added `aria-label="Product"`
- **Reason:** Same as above.

### 4. Add Product button icon alt text
- **Element:** `<img [src]="'./assets/add.png'" class="icon">` (inside Add Product button)
- **Change:** Added `alt=""`
- **Reason:** Button text already names the action; icon is decorative.

### 5. Products tree accessible name
- **Element:** `<tree-root #tree ...>`
- **Change:** Added `aria-label="Products"`
- **Reason:** Tree component had no accessible name.

### 6. Product Total label icon alt text
- **Element:** `<img class="icon" [src]="'./assets/review.png'">` (inside Product Total label)
- **Change:** Added `alt=""`
- **Reason:** The adjacent text already describes the section; icon is decorative.

### 7. Add Row button icon alt text
- **Element:** `<img [src]="'./assets/add.png'" class="icon">` (inside Add Row button)
- **Change:** Added `alt=""`
- **Reason:** Button text already names the action; icon is decorative.

### 8. Product ledger grid accessible name
- **Element:** `<ag-grid-angular ...>`
- **Change:** Added `aria-label="Product ledger entries"`
- **Reason:** The grid had no accessible label; screen readers could not announce the grid's purpose.

### 9. Save button icon alt text
- **Element:** `<img class="icon" [src]="'./assets/action_save.gif'">` (inside Save button)
- **Change:** Added `alt=""`
- **Reason:** Button text already names the action; icon is decorative.

---

## product-orders.component.html

### 1. Header basket icon alt text
- **Element:** `<img [src]="'./assets/basket.png'" class="icon">` (inside label)
- **Change:** Added `alt=""`
- **Reason:** Label text "Product Orders" already names the section; icon is decorative.

### 2. Lab filter combo-box label
- **Element:** `<custom-combo-box placeholder="Lab" ...>`
- **Change:** Added `aria-label="Lab"`
- **Reason:** `placeholder` is not a reliable accessible name for custom components.

### 3. Core Facility filter combo-box label
- **Element:** `<custom-combo-box placeholder="Core Facility" ...>`
- **Change:** Added `aria-label="Core Facility"`
- **Reason:** Same as above.

### 4. Status filter combo-box label
- **Element:** `<custom-combo-box placeholder="Status" ...>`
- **Change:** Added `aria-label="Status"`
- **Reason:** Same as above.

### 5. Product Type filter combo-box label
- **Element:** `<custom-combo-box placeholder="Product Type" ...>`
- **Change:** Added `aria-label="Product Type"`
- **Reason:** Same as above.

### 6. Display mode toggle group label
- **Element:** `<mat-button-toggle-group [(ngModel)]="this.displayMode" ...>`
- **Change:** Added `aria-label="Display mode"`
- **Reason:** The toggle group (Detail / Overview) had no accessible group label; screen readers could not announce the purpose of the toggle buttons.

### 7. Product orders tree accessible name
- **Element:** `<tree-root #tree ...>`
- **Change:** Added `aria-label="Product orders"`
- **Reason:** Tree component had no accessible name.

### 8. Tree node icon alt text
- **Element:** `<img src="{{node?.data?.icon}}" class="icon tree-node-icon">`
- **Change:** Added `alt=""`
- **Reason:** The adjacent `<span>` already provides the node's display text; the icon is decorative.

### 9. Lab orders grid accessible name
- **Element:** `<ag-grid-angular (gridReady)="this.onLabGridReady($event)" ...>`
- **Change:** Added `aria-label="Lab product orders"`
- **Reason:** Grid had no accessible label.

### 10. Product order detail tab group label
- **Element:** `<mat-tab-group class="full-height">`
- **Change:** Added `aria-label="Product order details"`
- **Reason:** The tab group (Product Order Info / Line Items / Files) had no accessible group name.

### 11. Product order review icon alt text
- **Element:** `<img [src]="'./assets/review.png'" class="icon">` (inside label)
- **Change:** Added `alt=""`
- **Reason:** Adjacent label text already identifies the product order; icon is decorative.

### 12. Product order info table accessible name
- **Element:** `<table *ngIf="this.currentProductOrder" class="half-width">`
- **Change:** Added `aria-label="Product order information"`
- **Reason:** The key-value table (Submitter, Lab, Submit Date, etc.) had no label to orient screen reader users.

### 13. Line items grid accessible name
- **Element:** `<ag-grid-angular (gridReady)="this.onProductOrderGridReady($event)" ...>`
- **Change:** Added `aria-label="Product order line items"`
- **Reason:** Grid had no accessible label.

### 14. Overview grid accessible name
- **Element:** `<ag-grid-angular (gridReady)="this.onOverviewGridReady($event)" ...>`
- **Change:** Added `aria-label="Product order overview"`
- **Reason:** Grid had no accessible label.

### 15. Change Status combo-box label
- **Element:** `<custom-combo-box placeholder="Change Status" ...>`
- **Change:** Added `aria-label="Change Status"`
- **Reason:** `placeholder` is not a reliable accessible name for custom components.

### 16. Go button icon alt text
- **Element:** `<img class="icon" [src]="'./assets/bullet_go.png'">` (inside Go button)
- **Change:** Added `alt=""`
- **Reason:** Button text "Go" already names the action; icon is decorative.

### 17. Delete button icon alt text
- **Element:** `<img class="icon" [src]="'./assets/delete.png'">` (inside Delete button)
- **Change:** Added `alt=""`
- **Reason:** Button text "Delete" already names the action; icon is decorative.

---

## work-authorization-type-selector-dialog.component.html

### 1. Note paragraph role
- **Element:** `<div class="padded">` (containing `*Note:` text)
- **Change:** Added `role="note"`
- **Reason:** The paragraph is a supplementary advisory note. `role="note"` explicitly identifies it as such to assistive technology, allowing users to navigate to or skip notes as needed.

### 2. Work authorization options list
- **Element:** `<div class="full-width full-height foreground bordered padded">` (containing option buttons)
- **Change:** Added `role="list" aria-label="Work authorization options"`
- **Reason:** The container holds a set of logically related option buttons; `role="list"` conveys this structure to screen reader users. The `aria-label` provides context for what the list represents.

### 3. Individual option items list role
- **Elements:** `<div *ngIf="showInternalButton ...>` and `<div *ngFor="let option of coreOptions" ...>`
- **Change:** Added `role="listitem"` to each option wrapper div
- **Reason:** Required companion to `role="list"` on the parent; allows screen readers to announce how many items are in the list and which item the user is on.

---

## Summary of ARIA patterns applied

| Pattern | Count |
|---|---|
| `alt=""` on decorative images in buttons/labels | 19 |
| `aria-label` on `custom-combo-box` | 13 |
| `aria-label` on `tree-root` | 4 |
| `aria-label` on `form` | 2 |
| `aria-label` on `ag-grid-angular` | 4 |
| `aria-label` on `table` | 2 |
| `aria-label` on `mat-button-toggle-group` | 1 |
| `aria-label` on `mat-tab-group` | 1 |
| `[attr.aria-label]` (dynamic, bound) | 2 |
| `role="note"` | 1 |
| `role="list"` + `role="listitem"` | 3 |
| **Total changes** | **52** |
