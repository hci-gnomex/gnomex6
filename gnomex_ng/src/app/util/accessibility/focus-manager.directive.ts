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

  @HostListener('focus', ['$event'])
  onHostFocus(event: FocusEvent): void {
    if (!this.containerEl) { return; }

    // Only intercept when focus lands directly on the host
    // (not bubbling up from inside the container)
    if (event.target !== this.host.nativeElement) { return; }

    // Find the roving-tabindex active node (tabindex="0") inside the tree/grid,
    // which is the node that was last active. If none, fall back to first tabbable.
    const activeNode = this.containerEl.querySelector<HTMLElement>('[tabindex="0"]');
    const target = activeNode ? activeNode : this.findFirstFocusable(this.containerEl);

    if (target) {
      target.focus();
    }
  }

  ngAfterViewInit(): void {
    // Make host focusable so keydown events can be received
    if (!this.host.nativeElement.hasAttribute('tabindex')) {
      this.renderer.setAttribute(this.host.nativeElement, 'tabindex', '0');
    }
    this.containerEl = this.findContainer();
    if (!this.containerEl) { return; }

    const parent = this.containerEl.parentElement;
    if (!parent) { return; }

    // Create sentinels
    this.beforeSentinel = this.createSentinel('before');
    this.afterSentinel = this.createSentinel('after');

    // Insert as siblings around the widget
    this.renderer.insertBefore(parent, this.beforeSentinel, this.containerEl);
    this.renderer.insertBefore(parent, this.afterSentinel, this.containerEl.nextSibling);

    // Listen for sentinel focus (when user tabs onto them, jump OUTSIDE the widget)
    this.unlistenBeforeFocus = this.renderer.listen(this.beforeSentinel, 'focus', () => {
      const activeNode = this.containerEl
        ? this.containerEl.querySelector<HTMLElement>('[tabindex="0"]')
        : null;
      const target = activeNode
        ? activeNode
        : (this.containerEl ? this.findFirstFocusable(this.containerEl) : null);
      if (target) {
        target.focus();
      } else {
        this.focusOutsideWidget('prev');
      }
    });

    this.unlistenAfterFocus = this.renderer.listen(this.afterSentinel, 'focus', () => {
      this.focusOutsideWidget('next');
    });

    // Optional (later): make the container tabbable so users can enter it
    // if (!this.containerEl.hasAttribute('tabindex')) {
    //   this.renderer.setAttribute(this.containerEl, 'tabindex', '0');
    // }
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

    if (this.beforeSentinel &&  this.beforeSentinel.parentElement) {
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

    if (event.key === 'Enter' && inside && this.invokeEnter) {
      this.invokeEnter(event);
    }

    // Only override Tab when focus is INSIDE the widget.
    if (event.key === 'Tab' && inside) {
      event.preventDefault();

      if (event.shiftKey) {
        if (this.beforeSentinel) {
          this.beforeSentinel.focus();
        }
      } else {
        if (this.afterSentinel) {
          this.afterSentinel.focus();
        }
      }
      return;
    }

    // F6 behavior
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

  // ----------------------------
  // Finding grid/tree container
  // ----------------------------
  private findContainer(): HTMLElement | null {
    const hostEl = this.host.nativeElement;

    const grid = hostEl.querySelector('ag-grid-angular') as HTMLElement | null;
    if (grid) { return grid; }

    const tree = hostEl.querySelector('tree-root') as HTMLElement | null;
    if (tree) { return tree; }

    return null;
  }

  // ----------------------------
  // Sentinels
  // ----------------------------
  private createSentinel(which: 'before' | 'after'): HTMLElement {
    const doc = this.host.nativeElement.ownerDocument;

    // Use a real element (button or span). Button is reliably focusable; span needs tabindex.
    const el = doc.createElement('span');

    this.renderer.setAttribute(el, 'tabindex', '0');
    this.renderer.addClass(el, 'sr-only');

    // Screen reader hint text
    const label =
      which === 'before'
        ? 'Start of grid or tree region. Press Tab to skip past this region, or Shift+Tab to move to the previous control. Use keyboard arrows to navigate'
        : 'End of grid or tree region. Press Tab to move to the next control, or Shift+Tab to move back into the region.';

    this.renderer.setAttribute(el, 'role', 'note');
    this.renderer.setAttribute(el, 'aria-label', label);

    return el;
  }

  // ----------------------------
  // Moving focus outside widget
  // ----------------------------
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

  /**
   * Finds the first focusable element AFTER the widget, skipping anything inside it.
   * This avoids scanning "every tabbable on the page" by using TreeWalker and stopping early.
   */
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
          return this.isActuallyTabbable(el) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
        }
      }
    );

    walker.currentNode = anchor;
    return walker.nextNode() as HTMLElement | null;
  }

  /**
   * Finds the first focusable element BEFORE the widget.
   * TreeWalker has no prevNode, so we walk backwards via DOM relationships and test candidates.
   */
  private findPrevFocusableOutside(anchor: HTMLElement): HTMLElement | null {
    const doc = this.host.nativeElement.ownerDocument;

    let node: Node | null = anchor;

    while (node) {
      const prev = node.previousSibling;
      if (prev) {
        node = prev;

        // dive to the deepest last child
        while (node.lastChild) { node = node.lastChild; }

        if (node instanceof HTMLElement) {
          const el = node as HTMLElement;
          if (!anchor.contains(el) && this.isActuallyTabbable(el)) { return el; }
        }
        continue;
      }

      node = node.parentNode;

      if (node && node instanceof HTMLElement) {
        const el = node as HTMLElement;
        if (!anchor.contains(el) && this.isActuallyTabbable(el)) { return el; }
      }
    }

    // If we hit the start, nothing to focus
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

  // ----------------------------
  // Focusable checks
  // ----------------------------
  private isActuallyTabbable(el: HTMLElement): boolean {
    // Removed from tab order
    if (el.getAttribute('tabindex') === '-1') { return false; }

    // Disabled controls
    if (
      el instanceof HTMLButtonElement ||
      el instanceof HTMLInputElement ||
      el instanceof HTMLSelectElement ||
      el instanceof HTMLTextAreaElement
    ) {
      if (el.disabled) { return false; }
    }

    // Hidden
    if (el.getAttribute('aria-hidden') === 'true') { return false; }

    const view = this.host.nativeElement.ownerDocument ? this.host.nativeElement.ownerDocument.defaultView : null;
    if (!view) { return false; }

    const style = view.getComputedStyle(el);
    if (!style) { return false; }

    if (style.display === 'none' || style.visibility === 'hidden') { return false; }

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) { return false; }

    // Anchors must have href to be tabbable
    if (el instanceof HTMLAnchorElement && !el.href) { return false; }

    // tabindex >= 0 or natively focusable are OK
    return el.tabIndex >= 0;
  }
}
