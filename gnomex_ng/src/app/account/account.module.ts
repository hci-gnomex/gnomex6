import {NgModule} from "@angular/core";
import {ACCOUNT_ROUTING} from "./account.routes";
import {AngularMaterialModule} from "../../modules/angular-material.module";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {UtilModule} from "../util/util.module";
import {AgGridModule} from "ag-grid-angular/main";
import {MyAccountComponent} from "./my-account.component";

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
    ],
    exports: [
        MyAccountComponent,
    ],
})

export class AccountModule {
}