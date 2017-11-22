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

import {NewBillingAccountComponent} from "./new-billing-account.component";
import {NEW_BILLING_ACCOUNT_ROUTING} from "./new-billing-account.routes";

import {UserMultipleSelectorModule} from "./user_multiple_selector/user-multiple-selector.module"

@NgModule({
	imports: [
		NEW_BILLING_ACCOUNT_ROUTING,
		ButtonModule,
		CheckBoxModule,
		CommonModule,
		ComboBoxModule,
		GnomexStyledDatePickerModule,
		GnomexStyledGridModule,
		InputModule,
		MultipleSelectorModule,
		UserMultipleSelectorModule,
		WindowModule
	],
	declarations: [
		NewBillingAccountComponent
	],
	exports: [
		NewBillingAccountComponent
	]
})
export class NewBillingAccountModule {
}
