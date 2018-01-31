import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";

import {ButtonModule} from "../../../modules/button.module"
import {CheckBoxModule} from "../../../modules/checkbox.module"
import {ComboBoxModule} from "../../../modules/combobox.module";
import {InputModule} from "../../../modules/input.module";
import {WindowModule} from "../../../modules/window.module";

import {GnomexStyledDatePickerModule} from "../../util/gnomexStyledDatePicker/gnomex-styled-date-picker.module";
import {GnomexStyledGridModule} from "../../util/gnomexStyledJqxGrid/gnomex-styled-grid.module";
import {MultipleSelectorModule} from "../../util/multipleSelector/multiple-selector.module";

import {FormsModule, ReactiveFormsModule} from "@angular/forms";

import {AccountFieldsConfigurationService} from "./account-fields-configuration.service";
import {NewBillingAccountService} from "./new-billing-account.service";

import {NewBillingAccountLauncher, NewBillingAccountComponent} from "./new-billing-account.component";
import {NEW_BILLING_ACCOUNT_ROUTING} from "./new-billing-account.routes";
import {NumberJqxInputComponent} from "./number-jqxinput/number-jqxinput.component";

import {UserMultipleSelectorModule} from "./user_multiple_selector/user-multiple-selector.module"

import {AngularMaterialModule} from "../../../modules/angular-material.module";


@NgModule({
	imports: [
		NEW_BILLING_ACCOUNT_ROUTING,
		AngularMaterialModule,
		ButtonModule,
		CheckBoxModule,
		CommonModule,
		ComboBoxModule,
		FormsModule,
		GnomexStyledDatePickerModule,
		GnomexStyledGridModule,
		InputModule,
		MultipleSelectorModule,
		ReactiveFormsModule,
		UserMultipleSelectorModule,
		WindowModule
	],
	declarations: [
		NewBillingAccountLauncher,
		NewBillingAccountComponent,
		NumberJqxInputComponent
	],
	entryComponents: [
		NewBillingAccountComponent
	],
	providers: [
		AccountFieldsConfigurationService,
		NewBillingAccountService
	],
	exports: [
		NewBillingAccountLauncher,
		NewBillingAccountComponent,
		NumberJqxInputComponent
	]
})
export class NewBillingAccountModule {
}
