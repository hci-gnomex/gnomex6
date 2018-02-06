import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";

import {WindowModule} from "../../../modules/window.module";

import {GnomexStyledGridModule} from "../../util/gnomexStyledJqxGrid/gnomex-styled-grid.module";
import {MultipleSelectorModule} from "../../util/multipleSelector/multiple-selector.module";

import {FormsModule, ReactiveFormsModule} from "@angular/forms";

import {AccountFieldsConfigurationService} from "./account-fields-configuration.service";
import {NewBillingAccountService} from "./new-billing-account.service";

import {NewBillingAccountLauncher, NewBillingAccountComponent} from "./new-billing-account.component";
import {NEW_BILLING_ACCOUNT_ROUTING} from "./new-billing-account.routes";

import {NewBillingAccountErrorDialogComponent} from "./dialogs/new-billing-account-error-dialog.component";
import {NewBillingAccountSuccessDialogComponent} from "./dialogs/new-billing-account-success-dialog.component";

import {AngularMaterialModule} from "../../../modules/angular-material.module";


@NgModule({
	imports: [
		NEW_BILLING_ACCOUNT_ROUTING,
		AngularMaterialModule,
		CommonModule,
		FormsModule,
		GnomexStyledGridModule,
		MultipleSelectorModule,
		ReactiveFormsModule,
		WindowModule
	],
	declarations: [
		NewBillingAccountComponent,
		NewBillingAccountLauncher,
		NewBillingAccountErrorDialogComponent,
		NewBillingAccountSuccessDialogComponent
	],
	entryComponents: [
		NewBillingAccountComponent,
		NewBillingAccountErrorDialogComponent,
		NewBillingAccountSuccessDialogComponent
	],
	providers: [
		AccountFieldsConfigurationService,
		NewBillingAccountService
	],
	exports: [
		NewBillingAccountComponent,
		NewBillingAccountLauncher,
		NewBillingAccountErrorDialogComponent,
		NewBillingAccountSuccessDialogComponent
	]
})
export class NewBillingAccountModule {
}
