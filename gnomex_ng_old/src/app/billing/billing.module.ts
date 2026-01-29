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
import {PriceViewComponent} from "./price-view.component";
import {InvoiceEmailWindowComponent} from "./invoice-email-window.component";
import {BillingGlInterfaceViewComponent} from "./billing-gl-interface-view.component";
import {NotesToCoreComponent} from "./notes-to-core.component";
import {AngularSplitModule} from "angular-split";

@NgModule({
    imports: [
        BILLING_ROUTING,
        CommonModule,
        FormsModule,
        AngularMaterialModule,
        ServicesModule,
        TreeModule.forRoot(),
        AgGridModule.withComponents([
            DateEditor,
            DateRenderer,
            SelectEditor,
            SelectRenderer,
            IconTextRendererComponent
        ]),
        UtilModule,
        ReactiveFormsModule,
        AngularSplitModule,
    ],
    declarations: [
        BillingFilterComponent,
        NavBillingComponent,
        PriceSheetViewComponent,
        PriceCategoryViewComponent,
        PriceViewComponent,
        InvoiceEmailWindowComponent,
        BillingGlInterfaceViewComponent,
        NotesToCoreComponent,
    ],
    exports: [],
    entryComponents: [
        PriceSheetViewComponent,
        PriceCategoryViewComponent,
        PriceViewComponent,
        InvoiceEmailWindowComponent,
        BillingGlInterfaceViewComponent,
        NotesToCoreComponent,
    ],
})

export class BillingModule {
}
