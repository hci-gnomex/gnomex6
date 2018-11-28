import { Routes, RouterModule } from "@angular/router";
import {SelectCoreComponent} from "./select-core.component";
import {RegisterUserComponent} from "./register-user.component";
import {RegisterUserResolverService} from "../../services/resolvers/register-user-resolver.service";


const ROUTES: Routes = [


    { path: 'register-user', component: SelectCoreComponent,  resolve: {registerUserInfo: RegisterUserResolverService}},
    { path: "register-user/:idCoreFacility", component:RegisterUserComponent, resolve:{registerUserInfo: RegisterUserResolverService}}


];

export const REGISTER_USER_ROUTES = RouterModule.forChild(ROUTES);