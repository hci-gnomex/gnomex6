import { AfterViewInit, Directive, ElementRef, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appAgGridHeaderA11yFix]'
})
export class AgGridHeaderA11yFixDirective implements AfterViewInit, OnDestroy {

  private obs: MutationObserver | null = null;

  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.fixAccessibilityForGrid(this.el.nativeElement as HTMLElement);
    });
  }

  ngOnDestroy(): void {
    // Only place we disconnect now
    if (this.obs) {
      this.obs.disconnect();
      this.obs = null;
    }
  }

  private fixAccessibilityForGrid(gridHostEl: HTMLElement): void {
    const gridRoot = gridHostEl.querySelector('.ag-root') as HTMLElement | null;
    if (!gridRoot) { return; }

    const applyFix = (): void => {
      const headerCheckboxes =
        gridRoot.querySelectorAll('.ag-header-cell .ag-checkbox input[type=\'checkbox\']');

      headerCheckboxes.forEach((checkbox: Element) => {
        if (!checkbox.hasAttribute('aria-label')) {
          const headerCell = checkbox.closest('.ag-header-cell') as HTMLElement;

          let columnName = headerCell ? headerCell.innerText.trim() : 'Unknown Column';
          columnName = columnName.replace(/role=".*?"/g, '').replace(/columnheader/g, '').trim();

          checkbox.setAttribute('aria-label', `Select all in ${columnName}`);

          const headerCheckboxContainer = checkbox.closest('.ag-header-select-all');
          const label = headerCheckboxContainer
            ? headerCheckboxContainer.querySelector('label')
            : null;

          if (label && !label.innerText.trim()) {
            label.innerText = `Select all in ${columnName}`;
          }
        }
      });
    };

    // Kill any previous observer (defensive)
    if (this.obs) {
      this.obs.disconnect();
      this.obs = null;
    }

    // Initial pass
    applyFix();

    const obs = new MutationObserver(() => {
      applyFix(); // keep running for lifetime
    });

    obs.observe(gridRoot, { childList: true, subtree: true });

    this.obs = obs;
  }
}
