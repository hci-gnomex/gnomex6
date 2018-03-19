import {RouterModule, Routes} from "@angular/router";
import {MyAccountComponent} from "./my-account.component";
import {SubRouteGuardService} from "../services/route-guards/sub-route-guard.service";

const ROUTES: Routes = [
    { path: "MyAccount", component: MyAccountComponent ,canActivate: [SubRouteGuardService] },
];

export const ACCOUNT_ROUTING = RouterModule.forChild(ROUTES);