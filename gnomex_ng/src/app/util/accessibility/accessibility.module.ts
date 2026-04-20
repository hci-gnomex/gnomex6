import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AgGridHeaderA11yFixDirective} from './app-ag-grid-header-a11y.directive';
import {FocusManagerDirective} from './focus-manager.directive';
import {AutofocusDirective} from './appAutoFocus';
import {ReadonlyDirective} from "./app-readonly.directive";


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [
    AgGridHeaderA11yFixDirective,
    FocusManagerDirective,
    ReadonlyDirective,
    AutofocusDirective

  ],
  exports: [
    AgGridHeaderA11yFixDirective,
    FocusManagerDirective,
    ReadonlyDirective,
    AutofocusDirective
  ]

})

export class AccessibilityModule {
}
