import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";

import { CalendarModule }	from "../../../modules/calendar.module";
import { InputModule }	from "../../../modules/input.module";
import { WindowModule }		from "../../../modules/window.module";

import {AngularMaterialModule} from "../../../modules/angular-material.module";

import {GnomexStyledDatePickerComponent} from "./gnomex-styled-date-picker.component";

@NgModule({
	imports: [
		AngularMaterialModule,
		BrowserModule,
		CalendarModule,
		CommonModule,
		FormsModule,
		InputModule,
		WindowModule
	],
	declarations: [
		GnomexStyledDatePickerComponent
	],
	exports: [
		GnomexStyledDatePickerComponent
	]
})
export class GnomexStyledDatePickerModule {
}
