import {RouterModule, Routes} from "@angular/router";
import {MyAccountComponent} from "./my-account.component";
import {SubRouteGuardService} from "../services/route-guards/sub-route-guard.service";
import {ResetPasswordComponent} from "./reset-password.component";
import {ChangePasswordComponent} from "./change-password.component";

const ROUTES: Routes = [
    { path: "MyAccount", component: MyAccountComponent ,canActivate: [SubRouteGuardService] },
    { path: "reset-password", component: ResetPasswordComponent },
    { path: "change-password/:guid", component: ChangePasswordComponent },
];

export const ACCOUNT_ROUTING = RouterModule.forChild(ROUTES);