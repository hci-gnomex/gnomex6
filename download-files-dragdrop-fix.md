# Download Files Drag-and-Drop Bug Fix

**File:** `gnomex_ng/src/app/util/download-files.component.ts`

## Problem

Same-panel drag-and-drop in the Download Files dialog was silently doing nothing. Additionally, cross-panel drag from "Files to Download" back to "Available Files" was also broken.

## Root Causes (Three Bugs)

### Bug 1: `allowDrop: true` allowed same-panel drops that did nothing useful

Both trees accepted drops from any source, including themselves. The `moveNode` handler had no meaningful logic for same-panel drops, so they showed a drop indicator but silently did nothing.

**Fix:** Changed `allowDrop` from `true` to a function that compares the dragged element's tree model against the target's tree model, returning `false` when they're the same.

```typescript
allowDrop: (element: TreeNode, to: {parent: TreeNode, index: number}) => {
    // Prevent same-panel drops — they have no semantic meaning in this dialog.
    return element.treeModel !== to.parent.treeModel;
},
```

---

### Bug 2: Cross-panel drag "Files to Download" → "Available Files" also silently did nothing

The de-selection branch in `moveNode` checked `from === this.filesToDownloadTreeComponent`. This is `true` only for programmatic calls where `from` is passed as a `TreeComponent` reference. For mouse drags, `from` is always a `TreeNode`, so this condition was always `false` and no files were ever de-selected via drag.

**Fix:** Resolve the source `TreeModel` from either call style, then compare against the known tree model:

```typescript
// Before (broken for mouse drags):
else if (tree === this.availableFilesTreeComponent.treeModel && from === this.filesToDownloadTreeComponent) {
    let files: TreeNode[] = from.treeModel.getActiveNodes();
    ...
}

// After (handles both programmatic and mouse-drag sources):
else if (tree === this.availableFilesTreeComponent.treeModel) {
    const sourceModel: TreeModel = from === this.filesToDownloadTreeComponent
        ? from.treeModel          // programmatic call: from is a TreeComponent
        : (from && from.treeModel); // mouse drag: from is a TreeNode
    if (sourceModel === this.filesToDownloadTreeComponent.treeModel) {
        let files: TreeNode[] = sourceModel.getActiveNodes();
        ...
    }
}
```

---

### Bug 3: `dragStart` only updated `treeMostRecentlySelectedFrom` when `!node.isActive`

If the dragged node was already selected/active, the source tree was never recorded. This caused `onRemoveFromDownload` (triggered when dragging over the "Available Files" panel) to silently bail out, because `treeMostRecentlySelectedFrom` still held a stale or `undefined` value.

**Fix:** Move `treeMostRecentlySelectedFrom = tree` outside the `if (!node.isActive)` guard so it is always set on drag start:

```typescript
// Before:
dragStart: (tree: TreeModel, node, $event) => {
    if (!node.isActive) {
        TREE_ACTIONS.TOGGLE_ACTIVE(tree, node, $event);
        this.treeMostRecentlySelectedFrom = tree; // only set when node wasn't already active
    }
}

// After:
dragStart: (tree: TreeModel, node, $event) => {
    if (!node.isActive) {
        TREE_ACTIONS.TOGGLE_ACTIVE(tree, node, $event);
    }
    // Always track the source tree so onRemoveFromDownload works correctly.
    this.treeMostRecentlySelectedFrom = tree;
}
```

## Background: How the Tree Library Passes `from`

In `@circlon/angular-tree-component`, the `drop` action handler receives:

- `tree` — the **target** node's `TreeModel`
- `node` — the **target** `TreeNode`
- `from` — the dragged element, which is:
  - A `TreeNode` for **mouse drags** (set by `TreeDragDirective`)
  - Whatever value is explicitly passed for **programmatic calls** (e.g., `onDropInDownload` passes `this.availableFilesTreeComponent`, a `TreeComponent`)

This distinction between `TreeNode` and `TreeComponent` was the core source of confusion in Bug 2.
