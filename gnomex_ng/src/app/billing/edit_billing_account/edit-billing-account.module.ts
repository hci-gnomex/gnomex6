import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

import {AngularMaterialModule} from "../../../modules/angular-material.module";
import {ServicesModule} from "../../services/services.module";

import {AccountFieldsConfigurationService} from "../../services/account-fields-configuration.service";
import {EditBillingAccountErrorDialogComponent} from "./dialogs/edit-billing-account-error-dialog.component";
import {EditBillingAccountSuccessDialogComponent} from "./dialogs/edit-billing-account-success-dialog.component";
import {EditBillingAccountLauncher, EditBillingAccountComponent} from "./edit-billing-account.component";

@NgModule({
	imports: [
		AngularMaterialModule,
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		ServicesModule
	],
	declarations: [
		EditBillingAccountComponent,
		EditBillingAccountErrorDialogComponent,
		EditBillingAccountLauncher,
		EditBillingAccountSuccessDialogComponent
	],
	entryComponents: [
		EditBillingAccountComponent,
		EditBillingAccountErrorDialogComponent,
		EditBillingAccountSuccessDialogComponent
	],
	providers: [
		AccountFieldsConfigurationService
	],
	exports: [
		EditBillingAccountComponent,
		EditBillingAccountErrorDialogComponent,
		EditBillingAccountLauncher,
		EditBillingAccountSuccessDialogComponent
	]
})
export class EditBillingAccountModule {
}
