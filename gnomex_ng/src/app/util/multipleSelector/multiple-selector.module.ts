import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {BrowserModule} from "@angular/platform-browser";

import {InputModule} from "../../../modules/input.module";
import {WindowModule} from "../../../modules/window.module";

import {GnomexStyledGridModule} from "../gnomexStyledJqxGrid/gnomex-styled-grid.module";

import {MultipleSelectorComponent} from "./multiple-selector.component";

@NgModule({
	imports: [
		BrowserModule,
		CommonModule,
		GnomexStyledGridModule,
		InputModule,
		WindowModule
	],
	declarations: [
		MultipleSelectorComponent
	],
	exports: [
		MultipleSelectorComponent
	]
})
export class MultipleSelectorModule {
}
