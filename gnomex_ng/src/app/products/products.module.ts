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

@NgModule({
    imports: [
        PRODUCTS_ROUTING,
        AngularMaterialModule,
        CommonModule,
        FormsModule,
        ServicesModule,
        UtilModule,
        ReactiveFormsModule,
        TreeModule,
        AgGridModule.withComponents([]),
    ],
    declarations: [
        ConfigureProductsComponent,
        ConfigureProductTypesComponent,
        ProductLedgerComponent,
        ProductOrdersComponent,
        AddLedgerEntryComponent,
        AddProductWindowComponent,
    ],
    exports: [
    ],
    entryComponents: [
        ConfigureProductTypesComponent,
        AddLedgerEntryComponent,
        AddProductWindowComponent,
    ]
})

export class ProductsModule {
}
