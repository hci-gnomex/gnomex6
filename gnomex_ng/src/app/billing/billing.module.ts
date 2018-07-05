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

@NgModule({
    imports: [
        BILLING_ROUTING,
        CommonModule,
        FormsModule,
        AngularMaterialModule,
        ServicesModule,
        TreeModule,
        AgGridModule.withComponents([]),
        UtilModule,
        ReactiveFormsModule,
    ],
    declarations: [
        BillingFilterComponent,
        NavBillingComponent,
    ],
    exports: [],
    entryComponents: [],
})

export class BillingModule {
}
