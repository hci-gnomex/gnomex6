import {NgModule} from "@angular/core";

import {AngularMaterialModule} from '../../modules/angular-material.module'
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ServicesModule} from "../services/services.module";
import {TreeModule} from "angular-tree-component";

import {AgGridModule} from "ag-grid-angular";
import {UtilModule} from "../util/util.module";
import {BILLING_ROUTING} from "./billing.routes";
import {BillingFilterComponent} from "./billing-filter.component";
import {NavBillingComponent} from "./nav-billing.component";
import {DateEditor} from "../util/grid-editors/date.editor";
import {DateRenderer} from "../util/grid-renderers/date.renderer";
import {SelectEditor} from "../util/grid-editors/select.editor";
import {SelectRenderer} from "../util/grid-renderers/select.renderer";
import {IconTextRendererComponent} from "../util/grid-renderers/icon-text-renderer.component";
import {PriceSheetViewComponent} from "./price-sheet-view.component";
import {PriceCategoryViewComponent} from "./price-category-view.component";

@NgModule({
    imports: [
        BILLING_ROUTING,
        CommonModule,
        FormsModule,
        AngularMaterialModule,
        ServicesModule,
        TreeModule,
        AgGridModule.withComponents([
            DateEditor,
            DateRenderer,
            SelectEditor,
            SelectRenderer,
            IconTextRendererComponent
        ]),
        UtilModule,
        ReactiveFormsModule,
    ],
    declarations: [
        BillingFilterComponent,
        NavBillingComponent,
        PriceSheetViewComponent,
        PriceCategoryViewComponent,
    ],
    exports: [],
    entryComponents: [
        PriceSheetViewComponent,
        PriceCategoryViewComponent,
    ],
})

export class BillingModule {
}
