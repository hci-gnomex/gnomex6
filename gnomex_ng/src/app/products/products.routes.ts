import { Routes, RouterModule } from "@angular/router";
import {ConfigureProductsComponent} from "./configure-products.component";

const ROUTES: Routes = [
    { path: "configure-products", component: ConfigureProductsComponent },
];

export const PRODUCTS_ROUTING = RouterModule.forChild(ROUTES);
