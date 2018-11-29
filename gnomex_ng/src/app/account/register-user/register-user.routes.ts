import { Routes, RouterModule } from "@angular/router";
import {SelectCoreComponent} from "./select-core.component";
import {RegisterUserResolverService} from "../../services/resolvers/register-user-resolver.service";


const ROUTES: Routes = [


    { path: 'register-user', component: SelectCoreComponent,  resolve: {registerUserInfo: RegisterUserResolverService}}


];

export const REGISTER_USER_ROUTES = RouterModule.forChild(ROUTES);