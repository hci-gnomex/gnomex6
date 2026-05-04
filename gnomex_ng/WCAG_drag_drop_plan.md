# WCAG Drag and Drop Compliance Plan — `gnomex_ng`

## Executive Summary

The codebase uses `@circlon/angular-tree-component` for all drag and drop across five components. All drag and drop is currently **mouse-only**, which violates WCAG 2.1.1 (Level A). Two additional WCAG criteria are partially or fully unmet. No work is needed on deprecated `aria-grabbed`/`aria-dropeffect` attributes (they are absent).

---

## WCAG Violations Found

| Criterion | Level | Violation | Components Affected |
|-----------|-------|-----------|---------------------|
| **2.1.1 Keyboard** | A | Drag and drop has no keyboard alternative — items cannot be moved without a mouse | All 5 drag-drop components |
| **2.5.7 Dragging Movements** (WCAG 2.2) | AA | No single-pointer (click-based) alternative to drag | All 5 drag-drop components |
| **4.1.3 Status Messages** | AA | No live region announces drag start, target, or drop completion to screen readers | All 5 drag-drop components |
| **1.3.3 Sensory Characteristics** | A | Hint text says "drag and drop" with no mention of keyboard/pointer alternative | browse-analysis, browse-experiments |

---

## Components In Scope

| File | Drag Behavior |
|------|--------------|
| `browse-experiments.component` | Move experiment to different request folder |
| `browse-analysis.component` | Move or copy (Ctrl+drag) analysis to group |
| `browse-datatracks.component` | Move datatrack to folder (dialog confirms) |
| `util/download-files.component` | Move files between two trees |
| `util/upload/organize-files.component` | Move files between upload/organize trees |

---

## Phase 1 — Keyboard Alternative for Node Moving (WCAG 2.1.1 Level A)

This is the highest-priority fix. The pattern is a "grab and place" keyboard interaction, similar to how screen reader users expect list reordering to work.

### 1.1 Create `TreeKeyboardMoveService`

**New file:** `src/app/util/accessibility/tree-keyboard-move.service.ts`

Responsibilities:
- Maintain state: `grabbedNode | null`, `sourceTree | null`
- Expose `grab(node, tree)`, `drop(targetNode, tree)`, `cancel()` methods
- Emit an `operationAnnouncement$: Observable<string>` for live region updates
- Support "copy mode" flag (for browse-analysis Ctrl+drag equivalent — use Ctrl+Space or a dedicated key)

### 1.2 Keyboard Interaction Pattern (per tree)


| Key | Action |
|-----|--------|
| `Space` or `M` on a draggable node | Grab node — announces "NodeName grabbed. Navigate to destination and press Enter to drop. Press Escape to cancel." |
| Arrow keys | Navigate tree normally while item is grabbed |
| `Enter` on a valid drop target | Drop — announces "NodeName moved to FolderName" |
| `Ctrl+Enter` | Drop as copy (browse-analysis only) — announces "NodeName copied to FolderName" |
| `Escape` | Cancel — announces "Move cancelled" |

Visual state: add a CSS class `keyboard-grabbed` to the grabbed node row so sighted users see it highlighted. Add `aria-selected="true"` while grabbed.

### 1.3 Changes per component

**`browse-experiments.component`**
- Extend tree `actionMapping.keys` to call `TreeKeyboardMoveService.grab()` / `drop()` / `cancel()`
- The existing `allowDrag` / `allowDrop` logic already encodes the business rules — reuse it to validate keyboard drop targets before confirming

**`browse-analysis.component`**
- Same as above, plus support `Ctrl+Enter` for copy mode (mirrors the existing Ctrl+drag code path in `moveNode`)

**`browse-datatracks.component`**
- Drop still opens the existing confirmation dialog — keyboard drop should trigger the same dialog as mouse drop (no separate code path needed)

**`download-files.component`**
- Two separate trees: grab in one, drop into the other
- `TreeKeyboardMoveService` must handle cross-tree drops; the service needs references to both `TreeComponent` instances via `@ViewChild`

**`organize-files.component`**
- Same cross-tree pattern as download-files

---

## Phase 2 — Live Region Announcements (WCAG 4.1.3 Level AA)

### 2.1 Add a shared announcement region

**New file:** `src/app/util/accessibility/aria-announcer.service.ts`

A singleton Angular service wrapping a single `aria-live="assertive"` `<div>` injected into `<body>`. (Angular CDK `LiveAnnouncer` can be used instead if the CDK version supports it — check `@angular/cdk@8.2.3`.)

### 2.2 Add the live region to the app shell

In `app.component.html` (or equivalent root template):

```html
<div id="aria-announcer"
     aria-live="assertive"
     aria-atomic="true"
     class="sr-only">
</div>
```

### 2.3 Announcement strings needed

| Event | Announcement |
|-------|-------------|
| Grab | `"[NodeName] grabbed. Navigate to a destination folder and press Enter to drop. Press Escape to cancel."` |
| Navigate over valid target | `"Over [FolderName]"` |
| Navigate over invalid target | `"[FolderName] — cannot drop here"` |
| Drop complete (move) | `"[NodeName] moved to [FolderName]"` |
| Drop complete (copy) | `"[NodeName] copied to [FolderName]"` |
| Cancel | `"Move cancelled"` |
| Mouse drop complete | `"[NodeName] moved to [FolderName]"` (hook into existing `onMoveNode` / `moveNode` handlers) |

Mouse drop announcements (the last row) require adding a single `ariaAnnouncer.announce(...)` call into each component's existing `moveNode` / `onMoveNode` handler — a small, low-risk change.

---

## Phase 3 — Single-Pointer Alternative (WCAG 2.5.7 Level AA)

WCAG 2.5.7 requires that dragging can be replaced by a single tap/click sequence. The simplest compliant approach is a **"Move to…" context menu** on each tree node.

### 3.1 Add context menu to tree node templates

In each tree `#treeNodeTemplate`, add a button that opens a modal or inline dropdown listing valid drop targets:

```html
<button class="sr-only-focusable"
        aria-label="Move {{node.data.label}} — open move options"
        (click)="openMoveDialog(node)">
  Move…
</button>
```

The button uses `sr-only-focusable` (visible on focus) so sighted keyboard users also benefit.

### 3.2 `MoveToDialogComponent` (new or reuse existing dialog pattern)

A simple `MatDialog` that:
- Shows a flat list of valid target folders (filtered using the existing `allowDrop` logic)
- User clicks a folder name to confirm
- Dialog calls the same `moveNode` service method as drag and drop

For browse-analysis, add a "Copy instead of move" checkbox in the dialog.

---

## Phase 4 — ARIA Markup Improvements

### 4.1 `aria-roledescription` on draggable nodes

Each draggable tree node should announce its affordance:

```html
<div role="treeitem"
     [attr.aria-label]="node.data.label"
     [attr.aria-roledescription]="'draggable ' + node.data.typeLabel">
```

Where `typeLabel` is "experiment", "analysis", "data track", or "file" as appropriate.

### 4.2 `aria-describedby` pointing to keyboard instructions

Add a visually hidden element near each tree that describes how to move items without a mouse:

```html
<p id="tree-move-instructions" class="sr-only">
  To move an item without dragging: navigate to it with arrow keys,
  press Space to grab, navigate to the destination, then press Enter to drop.
  Press Escape to cancel.
</p>
<tree-root aria-describedby="tree-move-instructions" …>
```

### 4.3 Update drag-drop hint text

In `browse-experiments` and `browse-analysis`, update the `DRAG_DROP_HINT` / `DRAG_AND_DROP_HINT` constants to also describe the keyboard alternative:

> "You can move items by dragging them to a new location, or by navigating with the arrow keys, pressing Space to grab an item, and pressing Enter to drop it."

### 4.4 Fix `role="alert"` vs `role="status"` inconsistency

- `browse-experiments.component.html` line 17 uses `role="alert"` for the drag-drop hint (alert is for urgent errors — change to `role="status"`)
- `browse-analysis.component.html` line 16 already correctly uses `role="status"`

### 4.5 Drop target indicator during keyboard move

When `TreeKeyboardMoveService` has an active grab and the user navigates to a node, add `aria-selected="true"` + CSS class `keyboard-drop-target` to indicate the current candidate destination.

---

## Phase 5 — Focus Management After Drop

### 5.1 After keyboard drop

Focus must move to the node in its new location after the tree re-renders. In each component's `moveNode` handler, after the tree refreshes:

```typescript
this.tree.treeModel.getNodeById(movedNodeId).setActiveAndVisible();
```

### 5.2 After mouse drop

The tree already handles this via `@circlon/angular-tree-component`'s built-in behavior, but verify that the moved node receives focus (it currently may not). If not, apply the same `setActiveAndVisible()` call in `onMoveNode`.

### 5.3 After dialog "Move to…" completes

Focus returns to the node that was moved (now at its new location), or to the tree root if the node is no longer visible.

---

## Implementation Order

```
Priority 1 (WCAG A blocker):
  Phase 1 — TreeKeyboardMoveService + per-component keyboard wiring
  Phase 4.2 — sr-only keyboard instructions text

Priority 2 (WCAG AA):
  Phase 2 — AriaAnnouncerService + announcement hooks
  Phase 3 — MoveToDialogComponent + node context menu buttons

Priority 3 (polish / correctness):
  Phase 4.1 — aria-roledescription on draggable nodes
  Phase 4.3 — updated hint text copy
  Phase 4.4 — role="alert" to role="status" fix
  Phase 5 — post-drop focus management
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/app/util/accessibility/tree-keyboard-move.service.ts` | Grab/drop state machine + key handling |
| `src/app/util/accessibility/aria-announcer.service.ts` | Wraps `aria-live` region |
| `src/app/util/move-to-dialog/move-to-dialog.component.ts/.html` | Single-pointer "Move to…" dialog |

## Files to Modify

| File | Change |
|------|--------|
| `src/app/util/accessibility/focus-manager.directive.ts` | Wire Space/M/Enter/Escape to `TreeKeyboardMoveService` while grab is active |
| `src/app/experiments/browse-experiments.component.ts/.html` | Keyboard wiring, ARIA markup, hint text, `onMoveNode` announcement |
| `src/app/analysis/browse-analysis.component.ts/.html` | Same + copy-mode support |
| `src/app/datatracks/browse-datatracks.component.ts/.html` | Keyboard wiring + announcement |
| `src/app/util/download-files.component.ts` | Cross-tree keyboard grab/drop + announcement |
| `src/app/util/upload/organize-files.component.ts/.html` | Cross-tree keyboard grab/drop + announcement |
| `app.component.html` (or root template) | Add `aria-live` announcer region |

---

## What Does NOT Need to Change

- `aria-grabbed` / `aria-dropeffect` — not present, not needed (both are deprecated in ARIA 1.1)
- `role="tree"` / `role="treeitem"` markup — already correct throughout
- The underlying `moveNode` business logic — keyboard and pointer alternatives call the same methods
