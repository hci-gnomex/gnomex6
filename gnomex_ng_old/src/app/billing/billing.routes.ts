import { Routes, RouterModule } from "@angular/router";
import {NavBillingComponent} from "./nav-billing.component";

const ROUTES: Routes = [
    { path: "browse-billing", component: NavBillingComponent },
];

export const BILLING_ROUTING = RouterModule.forChild(ROUTES);
