import { Routes, RouterModule } from "@angular/router";
import {ConfigureProductsComponent} from "./configure-products.component";
import {ProductLedgerComponent} from "./product-ledger.component";
import {ProductOrdersComponent} from "./product-orders.component";

const ROUTES: Routes = [
    { path: "configure-products", component: ConfigureProductsComponent },
    { path: "product-ledger", component: ProductLedgerComponent },
    { path: "product-orders", component: ProductOrdersComponent },
];

export const PRODUCTS_ROUTING = RouterModule.forChild(ROUTES);
