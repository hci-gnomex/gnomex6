import {Directive, ElementRef, HostBinding, HostListener, Input} from '@angular/core';
import {TreeNode} from '@circlon/angular-tree-component';

@Directive({
  selector: '[appAccessibleTreeAction]'
})
export class AccessibleTreeActionDirective {

  @Input() treeNode: TreeNode | null = null;
  @Input() accessibleTreeActionIdPrefix = 'accessible-tree';

  @HostBinding('attr.tabindex') readonly tabindex = '-1';

  @HostBinding('attr.id')
  get id(): string | null {
    return this.treeNode ? `${this.accessibleTreeActionIdPrefix}-action-${this.treeNode.id}` : null;
  }

  constructor(private host: ElementRef<HTMLElement>) {}

  @HostListener('keydown.escape', ['$event'])
  onEscape(event: KeyboardEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const tree = this.host.nativeElement.closest('[appAccessibleTree]') as HTMLElement | null;
    if (tree) {
      tree.focus();
    }
  }
}
