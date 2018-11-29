

import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {ServicesModule} from "../../services/services.module";
import {AngularMaterialModule} from "../../../modules/angular-material.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {SelectCoreComponent} from "./select-core.component";
import {REGISTER_USER_ROUTES} from "./register-user.routes";
import {RegisterUserComponent} from "./register-user.component";


@NgModule({
    imports: [
        CommonModule,
        REGISTER_USER_ROUTES,
        ServicesModule,
        AngularMaterialModule,
        FormsModule,
        ReactiveFormsModule

    ],
    declarations: [SelectCoreComponent, RegisterUserComponent],
    providers: []
})
export class RegisterUserModule {
}
