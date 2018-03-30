import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

import {AngularMaterialModule} from "../../../modules/angular-material.module";
import {ServicesModule} from "../../services/services.module";

import {AccountFieldsConfigurationService} from "../../services/account-fields-configuration.service";
import {NewBillingAccountErrorDialogComponent} from "./dialogs/new-billing-account-error-dialog.component";
import {NewBillingAccountService} from "../../services/new-billing-account.service";
import {NewBillingAccountSuccessDialogComponent} from "./dialogs/new-billing-account-success-dialog.component";
import {NewBillingAccountLauncher, NewBillingAccountComponent} from "./new-billing-account.component";

import {NEW_BILLING_ACCOUNT_ROUTING} from "./new-billing-account.routes";

@NgModule({
	imports: [
		NEW_BILLING_ACCOUNT_ROUTING,
		AngularMaterialModule,
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		ServicesModule
	],
	declarations: [
		NewBillingAccountComponent,
		NewBillingAccountErrorDialogComponent,
		NewBillingAccountLauncher,
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
		NewBillingAccountErrorDialogComponent,
		NewBillingAccountLauncher,
		NewBillingAccountSuccessDialogComponent
	]
})
export class NewBillingAccountModule {
}
