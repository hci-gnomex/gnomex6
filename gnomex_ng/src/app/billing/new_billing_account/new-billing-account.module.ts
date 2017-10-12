import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";

import {ButtonModule} from "../../../modules/button.module"
import {CheckBoxModule} from "../../../modules/checkbox.module"
import {ComboBoxModule} from "../../../modules/combobox.module";
import {InputModule} from "../../../modules/input.module";
import {WindowModule} from "../../../modules/window.module";

import {GnomexStyledDatePickerModule} from "../../util/gnomexStyledDatePicker/gnomex-styled-date-picker.module";
import {GnomexStyledGridModule} from "../../util/gnomexStyledJqxGrid/gnomex-styled-grid.module";

import {LabUserSelectorComponent} from "./lab-user-selector.component";
import {NewBillingAccountComponent} from "./new-billing-account.component";
import {NEW_BILLING_ACCOUNT_ROUTING} from "./new-billing-account.routes";

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
		WindowModule
	],
	declarations: [
		NewBillingAccountComponent,
		LabUserSelectorComponent
	],
	exports: [
		NewBillingAccountComponent
	]
})
export class NewBillingAccountModule {
}
