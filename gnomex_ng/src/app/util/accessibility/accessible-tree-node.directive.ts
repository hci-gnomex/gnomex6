import {Directive, HostBinding, Input} from '@angular/core';
import {TreeNode} from '@circlon/angular-tree-component';

@Directive({
  selector: '[appAccessibleTreeNode]'
})
export class AccessibleTreeNodeDirective {

  @Input() treeNode: TreeNode | null = null;
  @Input() accessibleTreeNodeIdPrefix = 'accessible-tree';
  @Input() accessibleTreeNodeLabel: string | null = null;
  @Input() accessibleTreeNodeRoleDescription: string | null = null;
  @Input() accessibleTreeNodeSelected: boolean | null = null;

  @HostBinding('attr.role') readonly role = 'treeitem';

  @HostBinding('attr.id')
  get id(): string | null {
    return this.treeNode ? `${this.accessibleTreeNodeIdPrefix}-node-${this.treeNode.id}` : null;
  }

  @HostBinding('attr.aria-label')
  get ariaLabel(): string | null {
    if (this.accessibleTreeNodeLabel) { return this.accessibleTreeNodeLabel; }
    return this.treeNode && this.treeNode.data ? this.treeNode.data.label : null;
  }

  @HostBinding('attr.aria-roledescription')
  get ariaRoleDescription(): string | null {
    return this.accessibleTreeNodeRoleDescription;
  }

  @HostBinding('attr.aria-selected')
  get ariaSelected(): string | null {
    if (this.accessibleTreeNodeSelected !== null) {
      return this.accessibleTreeNodeSelected ? 'true' : 'false';
    }
    return this.treeNode && this.treeNode.isActive ? 'true' : 'false';
  }

  @HostBinding('attr.aria-expanded')
  get ariaExpanded(): string | null {
    if (!this.treeNode || !this.treeNode.hasChildren) { return null; }
    return this.treeNode.isExpanded ? 'true' : 'false';
  }
}
