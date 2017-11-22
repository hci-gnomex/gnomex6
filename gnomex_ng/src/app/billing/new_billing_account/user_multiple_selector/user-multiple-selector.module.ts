import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {BrowserModule} from "@angular/platform-browser";

import {InputModule} from "../../../../modules/input.module";
import {WindowModule} from "../../../../modules/window.module";

import {GnomexStyledGridModule} from "../../../util/gnomexStyledJqxGrid/gnomex-styled-grid.module";

import {UserMultipleSelectorComponent} from "./user-multiple-selector.component";

@NgModule({
	imports: [
		BrowserModule,
		CommonModule,
		GnomexStyledGridModule,
		InputModule,
		WindowModule
	],
	declarations: [
		UserMultipleSelectorComponent
	],
	exports: [
		UserMultipleSelectorComponent
	]
})
export class UserMultipleSelectorModule {
}
