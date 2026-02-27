import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AgGridHeaderA11yFixDirective} from "./app-ag-grid-header-a11y.directive";


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [
    AgGridHeaderA11yFixDirective

  ],
  exports: [
    AgGridHeaderA11yFixDirective
  ]

})

export class AccessibilityModule {
}
