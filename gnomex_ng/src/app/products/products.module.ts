import {PRODUCTS_ROUTING} from "./products.routes";
import {AngularMaterialModule} from "../../modules/angular-material.module";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ServicesModule} from "../services/services.module";
import {UtilModule} from "../util/util.module";
import {NgModule} from "@angular/core";
import {ConfigureProductsComponent} from "./configure-products.component";
import {TreeModule} from "angular-tree-component";
import {ConfigureProductTypesComponent} from "./configure-product-types.component";
import {ProductLedgerComponent} from "./product-ledger.component";
import {AgGridModule} from "ag-grid-angular";
import {AddLedgerEntryComponent} from "./add-ledger-entry.component";
import {AddProductWindowComponent} from "./add-product-window.component";
import {ProductOrdersComponent} from "./product-orders.component";
import {OrderProductsComponent} from "./order-products.component";
import {WorkAuthorizationTypeSelectorDialogComponent} from "./work-authorization-type-selector-dialog.component";
import {RouterModule} from "@angular/router";
import {NewBillingAccountModule} from "../billing/new_billing_account/new-billing-account.module";
import {DialogsModule} from "../util/popup/dialogs.module";

@NgModule({
    imports: [
        PRODUCTS_ROUTING,
        AngularMaterialModule,
        RouterModule,
        CommonModule,
        FormsModule,
        DialogsModule,
        ServicesModule,
        UtilModule,
        ReactiveFormsModule,
        TreeModule,
        NewBillingAccountModule,
        AgGridModule.withComponents([])
    ],
    declarations: [
        AddLedgerEntryComponent,
        AddProductWindowComponent,
        ConfigureProductsComponent,
        ConfigureProductTypesComponent,
        OrderProductsComponent,
        ProductLedgerComponent,
        ProductOrdersComponent,
        WorkAuthorizationTypeSelectorDialogComponent
    ],
    exports: [
    ],
    entryComponents: [
        ConfigureProductTypesComponent,
        AddLedgerEntryComponent,
        AddProductWindowComponent,
        ConfigureProductTypesComponent,
        WorkAuthorizationTypeSelectorDialogComponent
    ]
})

export class ProductsModule {
}
