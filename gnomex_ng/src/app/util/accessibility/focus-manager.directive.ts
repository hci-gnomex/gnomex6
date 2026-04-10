import {
  AfterViewInit,
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  Renderer2
} from '@angular/core';
import {TreeComponent, TreeModel} from '@circlon/angular-tree-component';
import {ColumnApi, GridApi} from "ag-grid-community";

/**
 * Manages keyboard focus for ag-grid and angular-tree-component widgets.
 *
 * Creates invisible sentinels before/after the widget so Tab naturally
 * enters and exits, while arrow-key navigation works inside.
 *
 * Usage (tree):
 *   <div appFocusManager [focusManagerTree]="myTreeComponent">
 *     <tree-root #myTreeComponent ...></tree-root>
 *   </div>
 *
 * Usage (grid):
 *   <div appFocusManager [focusManagerGrid]="myGrid">
 *     <ag-grid-angular #myGrid ...></ag-grid-angular>
 *   </div>
 */
@Directive({
  selector: '[appFocusManager]'
})
export class FocusManagerDirective implements AfterViewInit, OnDestroy {

  /** CSS class name (without leading dot) of a companion toolbar for F6 switching. */
  @Input() toolbarSelector: string | null = null;

  /** Optional callback invoked when Enter is pressed inside the widget. */
  @Input() invokeEnter: ((event: KeyboardEvent) => void) | null = null;

  /** id of an element whose text describes keyboard instructions (applied to before-sentinel). */
  @Input() focusManagerDescribedBy: string | null = null;

  /** Pass the TreeComponent reference so we can extract its TreeModel. */
  @Input() focusManagerTree: TreeComponent | null = null;

  /** Pass the ag-grid component reference so we can extract GridApi / ColumnApi. */
  @Input() focusManagerGrid: { api: GridApi; columnApi: ColumnApi } | null = null;

  // --- internal state ---
  private containerEl: HTMLElement | null = null;
  private isGrid = false;

  private treeModel: TreeModel | null = null;
  private gridApi: GridApi | null = null;
  private gridColumnApi: ColumnApi | null = null;

  private beforeSentinel: HTMLElement | null = null;
  private afterSentinel: HTMLElement | null = null;

  private unlistenBeforeFocus: (() => void) | null = null;
  private unlistenAfterFocus: (() => void) | null = null;
  private unlistenKeydown: (() => void) | null = null;

  constructor(
    private host: ElementRef<HTMLElement>,
    private renderer: Renderer2
  ) {}

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  ngAfterViewInit(): void {
    this.renderer.setAttribute(this.host.nativeElement, 'tabindex', '-1');

    this.containerEl = this.findContainer();
    if (!this.containerEl) { return; }

    // Determine widget type and extract typed APIs
    if (this.focusManagerTree) {
      this.treeModel = this.focusManagerTree.treeModel;
      this.isGrid = false;
    } else if (this.focusManagerGrid) {
      this.gridApi = this.focusManagerGrid.api;
      this.gridColumnApi = this.focusManagerGrid.columnApi;
      this.isGrid = true;
    } else {
      // Fallback: auto-detect from DOM
      this.isGrid = !!this.containerEl.querySelector('.ag-root');
    }

    const parent = this.containerEl.parentElement;
    if (!parent) { return; }

    // Create sentinels
    this.beforeSentinel = this.createSentinel('before');
    this.afterSentinel = this.createSentinel('after');

    this.renderer.insertBefore(parent, this.beforeSentinel, this.containerEl);
    this.renderer.insertBefore(parent, this.afterSentinel, this.containerEl.nextSibling);

    // -----------------------------------------------------------------------
    // Before-sentinel focus handler
    // -----------------------------------------------------------------------
    this.unlistenBeforeFocus = this.renderer.listen(
      this.beforeSentinel,
      'focus',
      (e: FocusEvent) => {
        if (!this.containerEl) { return; }

        const relatedTarget = e.relatedTarget as HTMLElement | null;

        // If relatedTarget is inside the container the user Shift-Tabbed
        // backward out of the widget — exit backward.
        if (relatedTarget && this.containerEl.contains(relatedTarget)) {
          this.focusOutsideWidget('prev');
          return;
        }

        // --- Grid entry ---
        // ag-grid manages its own tabindex="0" cell; just let the browser's
        // next Tab advance naturally into it.
        if (this.isGrid) {
          return;
        }

        // --- Tree entry ---
        this.enterTree();
      }
    );

    // -----------------------------------------------------------------------
    // After-sentinel focus handler
    // -----------------------------------------------------------------------
    this.unlistenAfterFocus = this.renderer.listen(
      this.afterSentinel,
      'focus',
      (e: FocusEvent) => {
        const relatedTarget = e.relatedTarget as HTMLElement | null;

        // relatedTarget inside container → user Tabbed forward out of widget.
        // Do nothing; let browser advance naturally on the next Tab press.
        if (relatedTarget && this.containerEl && this.containerEl.contains(relatedTarget)) {
          return;
        }

        // relatedTarget outside container → user Shift-Tabbed backward from
        // an element below the tree — exit backward.
        this.focusOutsideWidget('prev');
      }
    );

    // -----------------------------------------------------------------------
    // Capture-phase keydown — fires BEFORE the tree's own bubble-phase
    // handler, so document.activeElement is still on the node-content-wrapper
    // where the user actually pressed the key.
    // -----------------------------------------------------------------------
    const keyHandler = (event: KeyboardEvent) => { this.onKeyDown(event); };
    this.host.nativeElement.addEventListener('keydown', keyHandler, true);
    this.unlistenKeydown = () => {
      this.host.nativeElement.removeEventListener('keydown', keyHandler, true);
    };
  }

  ngOnDestroy(): void {
    if (this.unlistenKeydown) {
      this.unlistenKeydown();
      this.unlistenKeydown = null;
    }
    if (this.unlistenBeforeFocus) {
      this.unlistenBeforeFocus();
      this.unlistenBeforeFocus = null;
    }
    if (this.unlistenAfterFocus) {
      this.unlistenAfterFocus();
      this.unlistenAfterFocus = null;
    }

    if (this.beforeSentinel.parentElement) {
      this.renderer.removeChild(this.beforeSentinel.parentElement, this.beforeSentinel);
    }
    if (this.afterSentinel.parentElement) {
      this.renderer.removeChild(this.afterSentinel.parentElement, this.afterSentinel);
    }

    this.beforeSentinel = null;
    this.afterSentinel = null;
    this.containerEl = null;
    this.treeModel = null;
    this.gridApi = null;
    this.gridColumnApi = null;
  }

  // ---------------------------------------------------------------------------
  // Keyboard handling (capture phase — runs before the tree's own handler)
  // ---------------------------------------------------------------------------

  onKeyDown(event: KeyboardEvent): void {
    if (!this.containerEl) { return; }
    if (event.key !== 'Tab' && event.key !== 'F6' && event.key !== 'Enter') { return; }

    const doc = this.host.nativeElement.ownerDocument;
    const active = doc.activeElement as HTMLElement | null;
    const inside = !!active && this.containerEl.contains(active);

    // --- Enter ---
    if (event.key === 'Enter' && inside && this.invokeEnter) {
      this.invokeEnter(event);
      return;
    }

    // --- Tab ---
    if (event.key === 'Tab' && inside) {
      event.preventDefault();

      if (event.shiftKey) {
        if (this.isGrid) {
          // For grids, go to before-sentinel so the user can Shift-Tab out
          this.beforeSentinel.focus();
        } else {
          // For trees, exit backward directly
          this.focusOutsideWidget('prev');
        }
      } else {
        this.afterSentinel.focus();
      }
      return;
    }

    // --- F6 ---
    if (event.key === 'F6' && inside) {
      const toolbar = this.toolbarSelector
        ? (doc.querySelector(`.${this.toolbarSelector}`) as HTMLElement | null)
        : null;

      const firstToolbarFocusable = toolbar ? this.findFirstFocusable(toolbar) : null;

      if (firstToolbarFocusable) {
        firstToolbarFocusable.focus();
        event.preventDefault();
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Widget entry helpers
  // ---------------------------------------------------------------------------

  /**
   * Programmatically enter the tree so that arrow-key navigation works
   * immediately. This replicates what a real mouse click does:
   *   1. Find the node-content-wrapper to focus
   *   2. Dispatch mousedown + non-bubbling click to wake up the tree's
   *      internal keyboard handler without triggering `activate`
   *   3. Move DOM focus to the wrapper
   */
  private enterTree(): void {
    if (!this.containerEl) { return; }

    // Prefer a wrapper that already has tabindex="0" (previously focused node),
    // otherwise fall back to the first wrapper in the tree.
    let target: HTMLElement | null =
      this.containerEl.querySelector<HTMLElement>('.node-content-wrapper[tabindex="0"]');

    if (!target) {
      target = this.containerEl.querySelector<HTMLElement>('.node-content-wrapper');
      if (target) {
        target.setAttribute('tabindex', '0');
      }
    }

    if (!target) { return; }

    const focusTarget = target;

    setTimeout(() => {
      // mousedown wakes up the tree's internal state machine
      focusTarget.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true, cancelable: true })
      );
      // Non-bubbling click avoids triggering `activate` / treeOnSelect
      focusTarget.dispatchEvent(
        new MouseEvent('click', { bubbles: false, cancelable: true })
      );
      focusTarget.focus();
    }, 0);
  }

  // ---------------------------------------------------------------------------
  // DOM helpers
  // ---------------------------------------------------------------------------

  private findContainer(): HTMLElement | null {
    const hostEl = this.host.nativeElement;

    const grid = hostEl.querySelector('ag-grid-angular') as HTMLElement | null;
    if (grid) { return grid; }

    const tree = hostEl.querySelector('tree-root') as HTMLElement | null;
    if (tree) { return tree; }

    return null;
  }

  private createSentinel(which: 'before' | 'after'): HTMLElement {
    const doc = this.host.nativeElement.ownerDocument;
    const el = doc.createElement('span');

    this.renderer.setAttribute(el, 'tabindex', '0');
    this.renderer.addClass(el, 'sr-only');

    const regionType = this.isGrid ? 'grid' : 'tree';

    const label =
      which === 'before'
        ? `${regionType}. Tab to enter, arrows to navigate.`
        : `End of ${regionType}.`;

    this.renderer.setAttribute(el, 'aria-label', label);

    if (which === 'before' && this.focusManagerDescribedBy) {
      this.renderer.setAttribute(el, 'aria-describedby', this.focusManagerDescribedBy);
    }

    return el;
  }

  private isSentinel(el: HTMLElement): boolean {
    return el === this.beforeSentinel || el === this.afterSentinel;
  }

  // ---------------------------------------------------------------------------
  // Focus movement outside the widget
  // ---------------------------------------------------------------------------

  private focusOutsideWidget(dir: 'next' | 'prev'): void {
    if (!this.containerEl) { return; }

    const target =
      dir === 'next'
        ? this.findNextFocusableOutside(this.containerEl)
        : this.findPrevFocusableOutside(this.containerEl);

    if (target) {
      target.focus();
    }
  }

  private findNextFocusableOutside(anchor: HTMLElement): HTMLElement | null {
    const doc = this.host.nativeElement.ownerDocument;

    const walker = doc.createTreeWalker(
      doc.body,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node: Node) => {
          const el = node as HTMLElement;
          if (!el) { return NodeFilter.FILTER_SKIP; }
          if (anchor.contains(el)) { return NodeFilter.FILTER_REJECT; }
          if (this.isSentinel(el)) { return NodeFilter.FILTER_SKIP; }
          return this.isActuallyTabbable(el) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
        }
      }
    );

    walker.currentNode = anchor;
    return walker.nextNode() as HTMLElement | null;
  }

  private findPrevFocusableOutside(anchor: HTMLElement): HTMLElement | null {
    let node: Node | null = anchor;

    while (node) {
      const prev = node.previousSibling;
      if (prev) {
        node = prev;

        while (node.lastChild) { node = node.lastChild; }

        if (node instanceof HTMLElement) {
          const el = node;
          if (!anchor.contains(el) && !this.isSentinel(el) && this.isActuallyTabbable(el)) {
            return el;
          }
        }
        continue;
      }

      node = node.parentNode;

      if (node && node instanceof HTMLElement) {
        const el = node;
        if (!anchor.contains(el) && !this.isSentinel(el) && this.isActuallyTabbable(el)) {
          return el;
        }
      }
    }

    return null;
  }

  private findFirstFocusable(root: HTMLElement): HTMLElement | null {
    const candidates = root.querySelectorAll<HTMLElement>(
      'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    for (let i = 0; i < candidates.length; i++) {
      if (this.isActuallyTabbable(candidates[i])) { return candidates[i]; }
    }
    return null;
  }

  private isActuallyTabbable(el: HTMLElement): boolean {
    if (el.getAttribute('tabindex') === '-1') { return false; }

    if (
      el instanceof HTMLButtonElement ||
      el instanceof HTMLInputElement ||
      el instanceof HTMLSelectElement ||
      el instanceof HTMLTextAreaElement
    ) {
      if (el.disabled) { return false; }
    }

    if (el.getAttribute('aria-hidden') === 'true') { return false; }

    const view = this.host.nativeElement
      && this.host.nativeElement.ownerDocument && this.host.nativeElement.ownerDocument.defaultView;
    if (!view) { return false; }

    const style = view.getComputedStyle(el);
    if (!style) { return false; }

    if (style.display === 'none' || style.visibility === 'hidden') { return false; }

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) { return false; }

    if (el instanceof HTMLAnchorElement && !el.href) { return false; }

    return el.tabIndex >= 0;
  }
}
