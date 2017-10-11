import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";

import {ButtonModule} from "../../../modules/button.module"
import {CheckBoxModule} from "../../../modules/checkbox.module"
import {ComboBoxModule} from "../../../modules/combobox.module";
import {InputModule} from "../../../modules/input.module";
import {WindowModule} from "../../../modules/window.module";

import {GnomexStyledDatePickerModule} from "../../util/gnomexStyledDatePicker/gnomex-styled-date-picker.module";

import { NewBillingAccountComponent } from "./new-billing-account.component";
import {NEW_BILLING_ACCOUNT_ROUTING} from "./new-billing-account.routes";

@NgModule({
	imports: [
		NEW_BILLING_ACCOUNT_ROUTING,
		ButtonModule,
		CheckBoxModule,
		CommonModule,
		ComboBoxModule,
		GnomexStyledDatePickerModule,
		InputModule,
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
