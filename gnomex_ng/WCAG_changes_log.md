# WCAG Drag-and-Drop Compliance — Change Log

**Project:** GNomEx Angular frontend (`gnomex_ng`)
**Branch:** `funny-cannon`
**Date completed:** 2026-03-25
**WCAG target:** 2.1 Level AA (with WCAG 2.2 criterion 2.5.7)

---

## Overview

Five components in the GNomEx Angular frontend used mouse-only drag-and-drop with no keyboard or single-pointer alternatives, violating several WCAG criteria. This log documents all changes made across five implementation phases.

### Violations addressed

| Criterion | Level | Description |
|-----------|-------|-------------|
| **2.1.1 Keyboard** | A | Drag-and-drop had no keyboard alternative |
| **4.1.3 Status Messages** | AA | No live region announced drag/drop events to screen readers |
| **2.5.7 Dragging Movements** | AA | No single-pointer (click-based) alternative to drag |
| **1.3.3 Sensory Characteristics** | A | Hint text said "drag and drop" with no mention of alternatives |
| **4.1.2 Name, Role, Value** | AA | Tree nodes lacked `aria-roledescription` and drop-target indicators |

### Components in scope

| Component | Drag behaviour |
|-----------|---------------|
| `browse-experiments.component` | Move experiment to a different project folder |
| `browse-analysis.component` | Move or copy (Ctrl+drag) analysis to a group |
| `browse-datatracks.component` | Move data track/folder (dialog confirms) |
| `util/download-files.component` | Move files between two trees |
| `util/upload/organize-files.component` | Move files from upload tree to organize tree |

---

## Phase 1 — Keyboard Alternative (WCAG 2.1.1 Level A)

### New files created

#### `src/app/util/accessibility/tree-keyboard-move.service.ts`
Singleton `@Injectable({ providedIn: 'root' })` service implementing a grab-and-drop state machine.

- **State:** holds `grabbedNode`, `sourceTree`, `copyMode`
- **`grab(node, tree, copyMode?)`** — initiates a grab; sets `node.data._kbGrabbed = true`; emits an announcement string
- **`tryDrop(targetNode, allowDropFn, copyMode?)`** — validates and completes a drop; clears grab state; emits announcement
- **`cancel()`** — cancels the grab; emits "Move cancelled"
- **`announcement$: Subject<string>`** — stream consumed by `AriaAnnouncerService`
- **`isGrabbing`, `isGrabbedNode(node)`, `state`** — read-only accessors used by components and `nodeClass`

#### `src/app/util/accessibility/aria-announcer.service.ts`
Singleton service that creates a single `<div id="gnomex-aria-announcer" role="status" aria-live="assertive" aria-atomic="true" class="sr-only">` in `document.body`.

- Subscribes to `TreeKeyboardMoveService.announcement$` automatically
- `announce(message)` — clears the region then sets text after 50 ms (ensures re-announcements fire even for identical strings)
- Injected into `GnomexAppComponent` constructor to guarantee early instantiation

### Modified: `src/styles.css`
Added `.sr-only` class (visually hidden, screen-reader visible):
```css
.sr-only { position: absolute; width: 1px; height: 1px; ... }
```

### Per-component changes (Phase 1)

Each component received the following common treatment, plus component-specific business-logic wiring:

**Keyboard mapping added to tree `actionMapping.keys`:**

| Key | Action |
|-----|--------|
| `Space` | Grab the focused node (calls `_kbGrab`) |
| `Enter` | Drop onto focused node if grab is active (calls `_kbDrop`); otherwise expand/collapse |
| `[27]` (Escape) | Cancel grab (`treeKbMove.cancel()`) — raw keycode used because KEYS enum has no ESC |
| `RIGHT` / `LEFT` | Set to `undefined` to allow native tree expand/collapse |

**`_kbGrab(node)`** — validates `allowDrag` business rules, calls `treeKbMove.grab()`
**`_kbDrop(targetNode)`** — validates `allowDrop` business rules, calls `treeKbMove.tryDrop()`, then delegates to the existing mouse `moveNode` handler
**`nodeClass`** — returns `' keyboard-grabbed'` CSS class for the grabbed node (for visual highlight)
**`KB_MOVE_INSTRUCTIONS`** — constant string; added as `<p class="sr-only">` near the tree, referenced by `aria-describedby` on `<tree-root>`

#### browse-experiments
- `_kbGrab`: requires `node.isLeaf && node.data.idRequest && !isGuest`
- `_kbDrop`: `allowDrop = !parent.data.labName`; delegates to `onMoveNode()`

#### browse-analysis
- `_kbGrab`: requires `node.isLeaf && node.data.idAnalysis && !isGuest`
- `_kbDrop`: supports `Ctrl+Enter` copy mode (mirrors Ctrl+drag); delegates to `moveNode()`
- `DRAG_AND_DROP_HINT` updated to mention keyboard + Ctrl+Enter copy alternative

#### browse-datatracks
- `_kbGrab`: requires `node.data.isDataTrackFolder || node.data.idDataTrack`
- `_kbDrop`: `allowDrop = isDataTrackFolder && idDataTrackFolder !== parent.idDataTrackFolder`; opens the same `MoveDataTrackComponent` dialog as mouse drop

#### download-files
- Two trees share one `filesOptions` object; cross-tree drops detected by comparing `targetTree` to `@ViewChild` references
- `_kbDrop`: moving to `filesToDownloadTree` → `selectFilesRecursively(..., 'Y')`; moving to `availableFilesTree` → `selectFilesRecursively(..., 'N')`

#### organize-files
- `_kbGrab`: checks `PROTECTED !== 'Y'`; if organize tree, also requires `node.level > 1`
- `_kbDrop`: only organize tree accepts drops; validates root-or-dir; calls `UtilService.getFileNodesToMove` + `attemptRemove`

---

## Phase 2 — Live Region Announcements (WCAG 4.1.3 Level AA)

### Modified: `src/app/gnomex-app.component.ts`
Injected `AriaAnnouncerService` in the root component constructor to guarantee the `aria-live` region is created before any tree interaction.

### Per-component announcement hooks

Each component had `AriaAnnouncerService` injected and calls added in the existing mouse `moveNode` / `onMoveNode` handler:

| Component | Announcement trigger | Example string |
|-----------|---------------------|----------------|
| browse-experiments | `onMoveNode` | `"Moving Exp-123 to ProjectA. A reassignment confirmation dialog has opened."` |
| browse-analysis | HTTP success callback | `"Analysis X moved to GroupY."` / `"Analysis X copied to GroupY."` |
| browse-datatracks | dialog close callback | `"DataTrack A moved to FolderB."` |
| download-files | `moveNode` handler | `"file.fastq added to download list."` / `"file.fastq removed from download list."` |
| organize-files | `moveNode` handler | `"sample.bam moved to results."` |

Keyboard grab/drop announcements are emitted automatically by `TreeKeyboardMoveService` (e.g., `"NodeName grabbed. Navigate to destination and press Enter to drop. Press Escape to cancel."`).

---

## Phase 4 — ARIA Markup Improvements (WCAG 4.1.2 + 1.3.3)

### Modified: `src/styles.css`
Added visual CSS classes for keyboard drag state:

```css
.keyboard-grabbed > .tree-node      { outline: 3px solid #1a73e8; background: #e8f4fe; }
.keyboard-drop-target > .tree-node  { outline: 2px dashed #1a73e8; background: #d2e9fb; }
.keyboard-drop-invalid > .tree-node { outline: 2px dashed #d93025; background: #fce8e6; }
```

### Per-component changes (Phase 4)

#### Each component's `nodeClass` option updated to include:
- `keyboard-grabbed` — on the node currently held by the keyboard grab
- `keyboard-drop-target` — on the focused node when it is a valid drop target
- `keyboard-drop-invalid` — on the focused node when it is NOT a valid drop target

#### Each component gained two new public methods for templates:

**`nodeRoleDesc(node): string | null`**
Returns a human-readable `aria-roledescription` that replaces the generic "treeitem" label:

| Component | Examples |
|-----------|---------|
| browse-experiments | `"draggable experiment"`, `"project folder"`, `"lab group"` |
| browse-analysis | `"draggable analysis"`, `"analysis group folder"`, `"lab group"` |
| browse-datatracks | `"draggable data track"`, `"draggable data track folder"`, `"genome build"`, `"organism"` |
| download-files | `"draggable file"`, `"draggable folder"` |
| organize-files | `"draggable file"`, `"draggable folder"`, `"protected file"`, `"root folder"` |

**`isKbDropTarget(node): boolean`**
Returns `true` when a keyboard grab is active and `node` is the focused node AND a valid drop target. Used to set `[attr.aria-selected]="isKbDropTarget(node) ? 'true' : null"` on the treeitem div.

#### HTML template changes (all 5 components):
```html
<div role="treeitem"
     [attr.aria-label]="node.data.label"
     [attr.aria-roledescription]="nodeRoleDesc(node)"
     [attr.aria-selected]="isKbDropTarget(node) ? 'true' : null">
```

#### `browse-experiments.component.html`
- Fixed `role="alert"` → `role="status"` on the drag-drop hint div (alert is for urgent errors only)
- Added `<p id="exp-tree-kb-instructions" class="sr-only">` with keyboard instructions
- Added `aria-describedby="exp-tree-kb-instructions"` to `<tree-root>`

#### All other browse components
- Added `<p id="...-tree-kb-instructions" class="sr-only">` and `aria-describedby` wiring

---

## Phase 3 — Single-Pointer Alternative (WCAG 2.5.7 Level AA)

### New file: `src/app/util/move-to-dialog/move-to-dialog.component.ts`

A reusable `MoveToDialogComponent` that satisfies WCAG 2.5.7 by offering a click-only alternative to drag. It presents a scrollable `<ul role="listbox">` of valid destination folders/groups. The user clicks an item (or presses Enter/Space) to confirm the move — no path-following gesture required.

**Exported interfaces:**
```typescript
interface MoveToTarget        { label: string; path?: string; data: any; }
interface MoveToDialogData    { sourceLabel: string; targets: MoveToTarget[]; allowCopy?: boolean; }
interface MoveToDialogResult  { target: MoveToTarget; copy: boolean; }
```

Includes an optional "Copy instead of move" `<mat-checkbox>` used by browse-analysis (mirrors Ctrl+drag behaviour).

### Modified: `src/app/util/util.module.ts`
- Added import for `MoveToDialogComponent`
- Added to `declarations`, `entryComponents`, and `exports`

### Modified: `src/styles.css`
Updated `.sr-only-focusable` to have a proper hidden-by-default base state. When not focused the "Move…" buttons are fully hidden (1×1 px clipped); when focused they appear with a visible blue outline:

```css
.sr-only-focusable { position: absolute; width: 1px; height: 1px; clip: rect(0,0,0,0); ... }
.sr-only-focusable:focus, .sr-only-focusable:active {
  position: static; width: auto; height: auto; clip: auto;
  outline: 2px solid #1a73e8; background: #fff; color: #1a73e8; ...
}
```

### Per-component changes (Phase 3)

#### browse-experiments
- **New TS method `_collectExpMoveTargets(node)`** — walks tree roots; returns all project nodes (grouped under their lab as `path`)
- **New TS method `openMoveDialog(node, $event)`** — opens `MoveToDialogComponent`; on close delegates result to existing `onMoveNode()`
- **HTML** — `<button class="sr-only-focusable" [attr.aria-label]="'Move ' + node.data.label" (click)="openMoveDialog(node, $event)">Move…</button>` added inside treeNodeTemplate, visible only on focus, shown only for draggable experiment nodes (`node.isLeaf && node.data.idRequest && !isGuest`)

#### browse-analysis
- **New TS method `_collectAnalysisMoveTargets(node)`** — collects all `idAnalysisGroup` nodes; includes lab name as `path` breadcrumb
- **New TS method `openMoveDialog(node, $event)`** — `allowCopy: true` in dialog data; on close calls `moveNode()` with `ctrlKey: result.copy`
- **HTML** — "Move…" button for analysis leaf nodes only

#### browse-datatracks
- **Added `MatDialog` injection** (was not previously injected)
- **New TS method `_collectDtMoveTargets(node)`** — collects all `isDataTrackFolder` nodes except the source node's current parent folder; includes parent folder name as `path`
- **New TS method `openMoveDialog(node, $event)`** — on close calls existing `moveNode()` with live `TreeNode` reference (looked up via `_findTreeNode()` helper)
- **New TS helper `_findTreeNode(data)`** — finds a live `TreeNode` by `idDataTrackFolder` or `idDataTrack` via `UtilService.findTreeNode`
- **HTML** — "Move…" button for `isDataTrackFolder` and `idDataTrack` nodes

#### download-files (direct-action buttons — no dialog needed)
- **New TS method `addToDownloadList(node, $event)`** — marks node as `isSelected = 'Y'`, marks ancestors, calls `updateFilesToDownloadTree()`, announces result
- **New TS method `removeFromDownloadList(node, $event)`** — marks node as `isSelected = 'N'`, calls `updateFilesToDownloadTree()`, announces result
- **HTML** — "Add to download list" button in the available-files tree template; "Remove from download list" button in the files-to-download tree template

#### organize-files
- **Added `MatDialog` injection**
- **New TS method `_collectOrganizeMoveTargets()`** — walks organize tree; returns root node + all `type === 'dir'` nodes
- **New TS method `openMoveDialog(node, $event)`** — on close performs the same node manipulation as `_kbDrop` (clone via `UtilService.getFileNodesToMove`, push to `FileDescriptor`, `attemptRemove`, `update`, `markAsDirty`); announces result; focuses target node
- **HTML** — "Move…" button in upload tree template for non-protected nodes only

---

## Phase 5 — Focus Management After Drop (WCAG 2.4.3)

### browse-datatracks — `treeUpdateData()` implemented
Previously empty. Now consumes `datatracksService.activeNodeToSelect` (already set by the `moveNode` dialog close callback and by `onDataTrackCreated` / `onDataTrackFolderCreated`):

```typescript
treeUpdateData(event) {
  const sel = this.datatracksService.activeNodeToSelect;
  if (sel) {
    const node = UtilService.findTreeNode(this.treeModel, sel.attribute, sel.value);
    if (node) {
      this.datatracksService.activeNodeToSelect = null;
      node.setIsActive(true);
      node.ensureVisible();
      node.scrollIntoView();
    }
  }
}
```

### browse-analysis — `_focusIdAfterRefresh` + `treeUpdateData()`
- Added `private _focusIdAfterRefresh: string | null = null`
- In `moveNode` SUCCESS callback (single-move only): `this._focusIdAfterRefresh = analyses[0].idAnalysis` before calling `refreshAnalysisGroupList_fromBackend()`
- `treeUpdateData()` extended: after stopping the search spinner, checks `_focusIdAfterRefresh`, calls `UtilService.findTreeNode(model, 'idAnalysis', id)`, activates and scrolls to the node, clears the field

### organize-files — `_kbDrop()` focus management
Added `setTimeout(() => { if (targetNode) { targetNode.setActiveAndVisible(); } }, 0)` after `organizeModel.update()`. The zero-delay timeout defers execution until after Angular's change-detection cycle re-renders the tree.

---

## Files Created

| File | Purpose |
|------|---------|
| `src/app/util/accessibility/tree-keyboard-move.service.ts` | Keyboard grab/drop state machine |
| `src/app/util/accessibility/aria-announcer.service.ts` | `aria-live` region wrapper |
| `src/app/util/move-to-dialog/move-to-dialog.component.ts` | Single-pointer "Move to…" dialog |
| `gnomex_ng/WCAG_drag_drop_plan.md` | Original 5-phase compliance plan |
| `gnomex_ng/WCAG_changes_log.md` | This file |

---

## Files Modified

| File | Phases | Key changes |
|------|--------|-------------|
| `src/styles.css` | 1, 4, 3 | `.sr-only`, `.sr-only-focusable`, `.keyboard-grabbed/drop-target/drop-invalid` |
| `src/app/gnomex-app.component.ts` | 2 | Injected `AriaAnnouncerService` |
| `src/app/util/util.module.ts` | 3 | Registered `MoveToDialogComponent` |
| `src/app/experiments/browse-experiments.component.ts` | 1, 2, 3, 4 | KB wiring, announcements, ARIA helpers, Move-to dialog |
| `src/app/experiments/browse-experiments.component.html` | 1, 4, 3 | KB instructions, `aria-roledescription`, `aria-selected`, "Move…" button |
| `src/app/analysis/browse-analysis.component.ts` | 1, 2, 3, 4, 5 | KB wiring, announcements, ARIA helpers, Move-to dialog, focus-after-refresh |
| `src/app/analysis/browse-analysis.component.html` | 1, 4, 3 | KB instructions, `aria-roledescription`, `aria-selected`, "Move…" button |
| `src/app/datatracks/browse-datatracks.component.ts` | 1, 2, 3, 4, 5 | KB wiring, announcements, ARIA helpers, Move-to dialog, `treeUpdateData` |
| `src/app/datatracks/browse-datatracks.component.html` | 1, 4, 3 | KB instructions, `aria-roledescription`, `aria-selected`, "Move…" button |
| `src/app/util/download-files.component.ts` | 1, 2, 3, 4 | KB wiring, announcements, ARIA helpers, direct-action buttons |
| `src/app/util/upload/organize-files.component.ts` | 1, 2, 3, 4, 5 | KB wiring, announcements, ARIA helpers, Move-to dialog, focus-after-drop |
| `src/app/util/upload/organize-files.component.html` | 1, 4, 3 | KB instructions, `aria-roledescription`, `aria-selected`, "Move…" button |

---

## Known Limitations / Future Work

- **browse-experiments Phase 5**: Focus management after drop is deferred — the move triggers a reassignment dialog that already handles focus, and the tree is rebuilt from the backend after dialog close. A robust solution would hook into the backend refresh subscription to call `setActiveAndVisible()` once the experiment appears at its new location.
- **download-files Phase 5**: Focus management after `updateFilesToDownloadTree()` was not implemented. The filter-based re-render makes it non-trivial to locate the moved node in the new tree without a dedicated id lookup after the update cycle.
- **Phase 3 — organize-files**: The "Move…" button is only on the upload tree (files being organized into the folder tree). A "Move to different folder" button on nodes already in the organize tree was not added as cross-folder reorganisation is less common and the keyboard alternative already covers it.
