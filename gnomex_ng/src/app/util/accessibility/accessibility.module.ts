import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AgGridHeaderA11yFixDirective} from './app-ag-grid-header-a11y.directive';
import {FocusManagerDirective} from './focus-manager.directive';
import {AutofocusDirective} from './appAutoFocus';
import {ReadonlyDirective} from './app-readonly.directive';
import {AccessibleTreeActionDirective} from './accessible-tree-action.directive';
import {AccessibleTreeDirective} from './accessible-tree.directive';
import {AccessibleTreeNodeDirective} from './accessible-tree-node.directive';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [
    AccessibleTreeActionDirective,
    AccessibleTreeDirective,
    AccessibleTreeNodeDirective,
    AgGridHeaderA11yFixDirective,
    FocusManagerDirective,
    ReadonlyDirective,
    AutofocusDirective

  ],
  exports: [
    AccessibleTreeActionDirective,
    AccessibleTreeDirective,
    AccessibleTreeNodeDirective,
    AgGridHeaderA11yFixDirective,
    FocusManagerDirective,
    ReadonlyDirective,
    AutofocusDirective
  ]

})

export class AccessibilityModule {
}
