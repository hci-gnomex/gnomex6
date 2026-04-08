import { AfterViewInit, Directive, ElementRef, HostListener, Input, OnDestroy, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appFocusManager]'
})
export class FocusManagerDirective implements AfterViewInit, OnDestroy {
  @Input() toolbarSelector: string | null = null;
  @Input() invokeEnter: ((event: KeyboardEvent) => void) | null = null;

  private containerEl: HTMLElement | null = null;

  private beforeSentinel: HTMLElement | null = null;
  private afterSentinel: HTMLElement | null = null;

  private unlistenBeforeFocus: (() => void) | null = null;
  private unlistenAfterFocus: (() => void) | null = null;

  constructor(
    private host: ElementRef<HTMLElement>,
    private renderer: Renderer2
  ) {}

  ngAfterViewInit(): void {
    this.renderer.setAttribute(this.host.nativeElement, 'tabindex', '-1');

    this.containerEl = this.findContainer();
    if (!this.containerEl) { return; }

    const parent = this.containerEl.parentElement;
    if (!parent) { return; }

    this.beforeSentinel = this.createSentinel('before');
    this.afterSentinel = this.createSentinel('after');

    this.renderer.insertBefore(parent, this.beforeSentinel, this.containerEl);
    this.renderer.insertBefore(parent, this.afterSentinel, this.containerEl.nextSibling);

    this.unlistenBeforeFocus = this.renderer.listen(this.beforeSentinel, 'focus', (e: FocusEvent) => {
      if (!this.containerEl) { return; }

      const relatedTarget = e.relatedTarget as HTMLElement | null;
      const isGrid = !!this.containerEl.querySelector('.ag-root');

      // If relatedTarget is inside the container the user shift-tabbed
      // backward out of the widget — exit backward
      if (relatedTarget && this.containerEl.contains(relatedTarget)) {
        this.focusOutsideWidget('prev');
        return;
      }

      // For grid — do nothing, let the browser's natural Tab advance
      // into the grid cell that ag-grid has already set tabindex="0" on
      if (isGrid) {
        return;
      }

      // For tree — must programmatically enter because tree nodes are
      // not naturally reachable by Tab (all have tabindex="-1" by default)
      let target: HTMLElement | null = null;

      const treeNode = this.containerEl.querySelector<HTMLElement>('.node-content-wrapper[tabindex="0"]');
      if (treeNode) {
        target = treeNode;
      }

      if (!target) {
        const firstTreeNode = this.containerEl.querySelector<HTMLElement>('.node-content-wrapper');
        if (firstTreeNode) {
          firstTreeNode.setAttribute('tabindex', '0');
          target = firstTreeNode;
        }
      }

      if (target) {
        const focusTarget = target;
        setTimeout(() => {
          focusTarget.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
          focusTarget.dispatchEvent(new MouseEvent('click', { bubbles: false, cancelable: true }));
          focusTarget.focus();
        }, 0);
      }
    });

    // After-sentinel: if user tabbed forward out of the widget just let
    // the browser handle the next Tab naturally from the sentinel.
    // If user shift-tabbed backward from below, exit backward.
    this.unlistenAfterFocus = this.renderer.listen(this.afterSentinel, 'focus', (e: FocusEvent) => {
      const relatedTarget = e.relatedTarget as HTMLElement | null;

      // relatedTarget is inside container — user tabbed forward out of widget
      // do nothing, let browser advance naturally on next Tab press
      if (relatedTarget && this.containerEl && this.containerEl.contains(relatedTarget)) {
        return;
      }

      // relatedTarget is outside container — user shift-tabbed backward
      // from a button below the tree — exit backward
      this.focusOutsideWidget('prev');
    });
  }

  ngOnDestroy(): void {
    if (this.unlistenBeforeFocus) {
      this.unlistenBeforeFocus();
      this.unlistenBeforeFocus = null;
    }
    if (this.unlistenAfterFocus) {
      this.unlistenAfterFocus();
      this.unlistenAfterFocus = null;
    }

    if (this.beforeSentinel && this.beforeSentinel.parentElement) {
      this.renderer.removeChild(this.beforeSentinel.parentElement, this.beforeSentinel);
    }
    if (this.afterSentinel && this.afterSentinel.parentElement) {
      this.renderer.removeChild(this.afterSentinel.parentElement, this.afterSentinel);
    }

    this.beforeSentinel = null;
    this.afterSentinel = null;
    this.containerEl = null;
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (!this.containerEl) { return; }
    if (event.key !== 'Tab' && event.key !== 'F6' && event.key !== 'Enter') { return; }

    const doc = this.host.nativeElement.ownerDocument;
    const active = doc.activeElement as HTMLElement | null;
    const inside = !!active && this.containerEl.contains(active);
    const isGrid = !!this.containerEl.querySelector('.ag-root');

    if (event.key === 'Enter' && inside && this.invokeEnter) {
      this.invokeEnter(event);
    }

    // For the tree, intercept Tab to prevent browser tabbing through
    // every internal node — send directly to sentinels instead.
    // For the grid, ag-grid manages its own internal Tab behavior so
    // we only intercept Tab to send to the after-sentinel.
    if (event.key === 'Tab' && inside) {
      event.preventDefault();

      if (event.shiftKey) {
        if (isGrid) {
          // Send to before-sentinel so screen reader announces "Start of region"
          // before-sentinel relatedTarget check will then exit backward
          if (this.beforeSentinel) {
            this.beforeSentinel.focus();
          }
        } else {
          // Tree: exit backward directly
          this.focusOutsideWidget('prev');
        }
      } else {
        if (this.afterSentinel) {
          this.afterSentinel.focus();
        }
      }
      return;
    }

    if (event.key === 'F6' && inside) {
      const toolbar = this.toolbarSelector
        ? (doc.querySelector(`.${this.toolbarSelector}`) as HTMLElement | null)
        : null;

      const firstToolbarFocusable = toolbar
        ? this.findFirstFocusable(toolbar)
        : null;

      if (firstToolbarFocusable) {
        firstToolbarFocusable.focus();
        event.preventDefault();
      }
    }
  }

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

    const label =
      which === 'before'
        ? 'Start of tree or grid region. Press Tab to enter and navigate with arrow keys.'
        : 'End of tree or grid region. Press Tab to move to the next control.';

    //this.renderer.setAttribute(el, 'role', 'note');
    this.renderer.setAttribute(el, 'aria-label', label);

    return el;
  }

  private isSentinel(el: HTMLElement): boolean {
    return el === this.beforeSentinel || el === this.afterSentinel;
  }

  private focusOutsideWidget(dir: 'next' | 'prev'): void {
    if (!this.containerEl) { return; }

    const target =
      dir === 'next'
        ? this.findNextFocusableOutside(this.containerEl)
        : this.findPrevFocusableOutside(this.containerEl);
    if (target) {
      target.focus();
    } else {
      console.log('couldn\'t focus outside widget because target is not found');
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
    const doc = this.host.nativeElement.ownerDocument;

    let node: Node | null = anchor;

    while (node) {
      const prev = node.previousSibling;
      if (prev) {
        node = prev;

        while (node.lastChild) { node = node.lastChild; }

        if (node instanceof HTMLElement) {
          const el = node as HTMLElement;
          if (!anchor.contains(el) && !this.isSentinel(el) && this.isActuallyTabbable(el)) { return el; }
        }
        continue;
      }

      node = node.parentNode;

      if (node && node instanceof HTMLElement) {
        const el = node as HTMLElement;
        if (!anchor.contains(el) && !this.isSentinel(el) && this.isActuallyTabbable(el)) { return el; }
      }
    }

    return null;
  }

  private findFirstFocusable(root: HTMLElement): HTMLElement | null {
    const candidates = root.querySelectorAll<HTMLElement>(
      'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    // tslint:disable-next-line:prefer-for-of
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

    const view = this.host.nativeElement.ownerDocument ? this.host.nativeElement.ownerDocument.defaultView : null;
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
