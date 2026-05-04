import {
  Directive,
  ElementRef,
  Host,
  HostBinding,
  HostListener,
  Input,
  Optional
} from '@angular/core';
import {TreeComponent, TreeModel} from '@circlon/angular-tree-component';

@Directive({
  selector: '[appAccessibleTree]'
})
export class AccessibleTreeDirective {

  @Input() treeComponent: TreeComponent | null = null;
  @Input() accessibleTreeIdPrefix = 'accessible-tree';

  @HostBinding('attr.role') readonly role = 'tree';
  @HostBinding('attr.tabindex') readonly tabindex = '0';

  @HostBinding('attr.aria-activedescendant')
  get activeDescendantId(): string | null {
    const node = this.treeModel && this.treeModel.focusedNode;
    return node ? `${this.accessibleTreeIdPrefix}-node-${node.id}` : null;
  }

  private get treeModel(): TreeModel | null {
    const component = this.treeComponent || this.hostTreeComponent;
    return component ? component.treeModel : null;
  }

  constructor(
    private host: ElementRef<HTMLElement>,
    @Optional() @Host() private hostTreeComponent: TreeComponent
  ) {}

  @HostListener('focusin')
  onFocusIn(): void {
    const treeModel = this.treeModel;
    if (!treeModel) { return; }

    treeModel.setFocus(true);
    if (!treeModel.focusedNode) {
      treeModel.focusNextNode();
    }
  }

  @HostListener('focusout', ['$event'])
  onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    const current = this.host.nativeElement;
    if (!next || !current.contains(next)) {
      const treeModel = this.treeModel;
      if (treeModel) {
        treeModel.setFocus(false);
      }
    }
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'F2') { return; }

    const treeModel = this.treeModel;
    const node = treeModel && treeModel.focusedNode;
    if (!node) { return; }

    const button = this.host.nativeElement.querySelector<HTMLElement>(
      `#${this.accessibleTreeIdPrefix}-action-${node.id}`
    );
    if (button) {
      event.preventDefault();
      event.stopPropagation();
      button.focus();
    }
  }
}
