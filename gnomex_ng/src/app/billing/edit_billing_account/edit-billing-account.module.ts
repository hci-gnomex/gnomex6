import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

import {AngularMaterialModule} from "../../../modules/angular-material.module";
import {ServicesModule} from "../../services/services.module";
import {UtilModule} from "../../util/util.module";

import {AccountFieldsConfigurationService} from "../../services/account-fields-configuration.service";
import {EditBillingAccountErrorDialogComponent} from "./dialogs/edit-billing-account-error-dialog.component";
import {EditBillingAccountLauncher, EditBillingAccountComponent} from "./edit-billing-account.component";

@NgModule({
	imports: [
		AngularMaterialModule,
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		ServicesModule,
        UtilModule
	],
	declarations: [
		EditBillingAccountComponent,
		EditBillingAccountErrorDialogComponent,
		EditBillingAccountLauncher,
	],
	entryComponents: [
		EditBillingAccountComponent,
		EditBillingAccountErrorDialogComponent,
	],
	providers: [
		AccountFieldsConfigurationService
	],
	exports: [
		EditBillingAccountComponent,
		EditBillingAccountErrorDialogComponent,
		EditBillingAccountLauncher,
	]
})
export class EditBillingAccountModule {
}
