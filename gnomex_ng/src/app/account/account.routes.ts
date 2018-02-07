import {RouterModule, Routes} from "@angular/router";
import {MyAccountComponent} from "./my-account.component";

const ROUTES: Routes = [
    { path: "MyAccount", component: MyAccountComponent },
];

export const ACCOUNT_ROUTING = RouterModule.forChild(ROUTES);