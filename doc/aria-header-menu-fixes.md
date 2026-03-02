# ARIA Header Menu Association Fixes

**Branch:** `ng8-aria-fixes`
**Files changed:** 3
**Commits:** `78bf312`, `c0a087a`, `8dbf382`

---

## Problem

The header component had two navigation panels — a top bar of utility links (`linkNavItems`) and the main nav row (`navItems`, `.header-two`) — each containing buttons that open Angular Material dropdown menus. Three ARIA issues prevented screen readers from correctly associating the buttons with their menus:

### 1. Invalid `aria-controls` IDs (spaces in values)

Both trigger buttons used:
```html
[attr.aria-controls]="'menu-' + item.displayName"
```

Display names like `'Data Tracks'`, `'Report Problem'`, and `'New Experiment Order'` contain spaces. The resulting IDs (`menu-Data Tracks`) are invalid HTML — IDs must not contain whitespace. The `aria-controls` attribute therefore pointed to a nonexistent element.

### 2. `[attr.id]` vs `[id]` on `<mat-menu>`

`menu-item.component.html` originally used:
```html
<mat-menu #childMenu="matMenu" [attr.id]="menuId">
```

`[attr.id]` sets the attribute on Angular's component **host element**, not on the CDK overlay panel that `mat-menu` actually renders. The overlay panel ID is managed internally by Angular Material. Using `[id]` (an `@Input()` on `MatMenu`) correctly sets the overlay panel's DOM `id`.

### 3. Missing `aria-expanded`

Both branch-node trigger buttons were missing `[attr.aria-expanded]="menuTrigger.menuOpen"`, so screen readers could not announce whether the menu was open or closed.

---

## Solution

### `menu-item.component.html`

Changed `[attr.id]` → `[id]` so the overlay panel gets the correct DOM id:

```html
<!-- Before -->
<mat-menu #childMenu="matMenu" [attr.id]="menuId" role="menu">

<!-- After -->
<mat-menu #childMenu="matMenu" [id]="menuId" role="menu">
```

### `header.component.ts`

Added a `toMenuId()` helper that sanitizes display names into valid HTML id slugs:

```typescript
public toMenuId(displayName: string): string {
    return 'menu-' + displayName.replace(/\s+/g, '-').toLowerCase();
}
```

Examples:
| `displayName` | `toMenuId()` result |
|---|---|
| `'Help'` | `'menu-help'` |
| `'Data Tracks'` | `'menu-data-tracks'` |
| `'New Experiment Order'` | `'menu-new-experiment-order'` |

### `header.component.html` — both nav panels

Applied to both the `linkNavItems` (top bar) and `navItems` (`.header-two`) branch-node button blocks:

```html
<!-- Before -->
<button mat-button
        #menuTrigger="matMenuTrigger"
        [attr.aria-controls]="'menu-' + item.displayName"
        aria-haspopup="menu"
        [matMenuTriggerFor]="menu.childMenu" ...>
</button>
<app-menu-item #menu [items]="item.children"
               [menuId]="'menu-' + item.displayName">
</app-menu-item>

<!-- After -->
<button mat-button
        #menuTrigger="matMenuTrigger"
        [attr.aria-controls]="toMenuId(item.displayName)"
        [attr.aria-expanded]="menuTrigger.menuOpen"
        aria-haspopup="menu"
        [matMenuTriggerFor]="menu.childMenu" ...>
</button>
<app-menu-item #menu [items]="item.children"
               [menuId]="toMenuId(item.displayName)">
</app-menu-item>
```

---

## Resulting ARIA chain

For a button like "Data Tracks":

```
button[aria-haspopup="menu"]
      [aria-controls="menu-data-tracks"]
      [aria-expanded="false|true"]
      [aria-label="Data Tracks menu"]
  →  mat-menu overlay panel[id="menu-data-tracks"][role="menu"]
       └─ button[role="menuitem"][aria-label="..."]
```

---

## Files Modified

| File | Change |
|---|---|
| `gnomex_ng/src/app/header/header.component.html` | `toMenuId()` in `aria-controls` and `menuId`; added `aria-expanded` to both nav panels |
| `gnomex_ng/src/app/header/header.component.ts` | Added `toMenuId()` helper method |
| `gnomex_ng/src/app/header/menu-item/menu-item.component.html` | `[attr.id]` → `[id]` on `<mat-menu>` |
