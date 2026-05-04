import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { TreeModel, TreeNode } from '@circlon/angular-tree-component';

/** Snapshot of a keyboard grab in progress. */
export interface KeyboardGrabState {
  node: TreeNode;
  tree: TreeModel;
  copyMode: boolean;
}

/**
 * Manages the keyboard grab-and-drop state machine used by all drag-and-drop
 * trees in the application (WCAG 2.1.1 keyboard alternative for drag and drop).
 *
 * Usage pattern in each tree component:
 *
 *   actionMapping.keys:
 *     [KEYS.SPACE] → TOGGLE_ACTIVE, then this.treeKbMove.grab(node, tree) when draggable
 *     [KEYS.ENTER] → if (isGrabbing) this.treeKbMove.tryDrop(…) else TOGGLE_EXPANDED
 *     [27]         → this.treeKbMove.cancel()        (Escape – not in KEYS enum)
 *
 * The `announcement$` stream emits human-readable strings intended for an
 * aria-live region (wired up in Phase 2 via AriaAnnouncerService).
 */
@Injectable({ providedIn: 'root' })
export class TreeKeyboardMoveService {

  private _state: KeyboardGrabState | null = null;

  /**
   * Emits plain-text announcements for screen readers.
   * Phase 2 will pipe these into an aria-live region.
   */
  readonly announcement$ = new Subject<string>();

  // ─── Public accessors ────────────────────────────────────────────────────

  get state(): KeyboardGrabState | null {
    return this._state;
  }

  get isGrabbing(): boolean {
    return this._state !== null;
  }

  isGrabbedNode(node: TreeNode): boolean {
    return this._state !== null && this._state.node === node;
  }

  // ─── State transitions ───────────────────────────────────────────────────

  /**
   * Begin a keyboard grab.  Calling grab() while already grabbing replaces
   * the current grab (allowing the user to change their mind before dropping).
   */
  grab(node: TreeNode, tree: TreeModel, copyMode: boolean = false): void {
    if (this._state) {
      this._clearGrabbedFlag(this._state.node);
    }
    this._state = { node, tree, copyMode };
    this._setGrabbedFlag(node, true);

    const label = this._labelOf(node);
    this.announcement$.next(
      `${label} grabbed. Navigate to a destination and press Enter to drop. ` +
      `Press Escape to cancel.`
    );
  }

  /**
   * Attempt to drop the grabbed item onto `targetNode`.
   *
   * @param targetNode  The tree node the user navigated to before pressing Enter.
   * @param allowDrop   The component's allowDrop predicate (same as in ITreeOptions).
   * @param copyMode    Override copy-mode; falls back to the value set during grab().
   * @returns `true` when the drop is valid and the caller should execute its
   *          move/copy logic; `false` when the target is invalid (grab stays active).
   */
  tryDrop(
    targetNode: TreeNode,
    allowDrop: (element: any, opts: { parent: any; index: number }) => boolean,
    copyMode?: boolean
  ): boolean {
    if (!this._state) { return false; }

    const effectiveCopy = copyMode !== undefined ? copyMode : this._state.copyMode;
    const canDrop = allowDrop(this._state.node, { parent: targetNode, index: 0 });

    const srcLabel    = this._labelOf(this._state.node);
    const targetLabel = this._labelOf(targetNode);

    if (!canDrop) {
      this.announcement$.next(`Cannot drop here: ${targetLabel}.`);
      return false;
    }

    this._clearGrabbedFlag(this._state.node);
    this._state = null;

    this.announcement$.next(
      effectiveCopy
        ? `${srcLabel} copied to ${targetLabel}.`
        : `${srcLabel} moved to ${targetLabel}.`
    );
    return true;
  }

  /** Cancel the current grab and announce it. */
  cancel(): void {
    if (!this._state) { return; }
    const label = this._labelOf(this._state.node);
    this._clearGrabbedFlag(this._state.node);
    this._state = null;
    this.announcement$.next(`Move cancelled. ${label} returned to original position.`);
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  /**
   * Stamps a `_kbGrabbed` flag on node.data so components can reflect the
   * grabbed state via their `nodeClass` option (adds CSS class `keyboard-grabbed`).
   */
  private _setGrabbedFlag(node: TreeNode, grabbed: boolean): void {
    if (node && node.data) {
      node.data._kbGrabbed = grabbed;
    }
  }

  private _clearGrabbedFlag(node: TreeNode): void {
    this._setGrabbedFlag(node, false);
  }

  private _labelOf(node: TreeNode): string {
    if (!node || !node.data) { return 'Item'; }
    return node.data.label || node.data.displayName || node.data.name || 'Item';
  }
}
