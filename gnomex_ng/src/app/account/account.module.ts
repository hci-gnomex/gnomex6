import {NgModule} from "@angular/core";
import {ACCOUNT_ROUTING} from "./account.routes";
import {AngularMaterialModule} from "../../modules/angular-material.module";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {UtilModule} from "../util/util.module";
import {AgGridModule} from "ag-grid-angular/main";
import {MyAccountComponent} from "./my-account.component";
import {LabMembershipRequestComponent} from "./lab-membership-request.component";
import {ResetPasswordComponent} from "./reset-password.component";
import {ChangePasswordComponent} from "./change-password.component";

@NgModule({
    imports: [
        ACCOUNT_ROUTING,
        CommonModule,
        AngularMaterialModule,
        FormsModule,
        UtilModule,
        AgGridModule.withComponents([]),
        ReactiveFormsModule,
    ],
    declarations: [
        MyAccountComponent,
        LabMembershipRequestComponent,
        ResetPasswordComponent,
        ChangePasswordComponent,
    ],
    exports: [
        MyAccountComponent,
        LabMembershipRequestComponent,
        ResetPasswordComponent,
        ChangePasswordComponent,
    ],
    entryComponents: [
        LabMembershipRequestComponent,
    ],
})

export class AccountModule {
}