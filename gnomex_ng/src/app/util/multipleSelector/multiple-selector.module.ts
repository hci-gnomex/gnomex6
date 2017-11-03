import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";

import {InputModule} from "../../../modules/input.module";
import {WindowModule} from "../../../modules/window.module";

import {GnomexStyledGridModule} from "../../util/gnomexStyledJqxGrid/gnomex-styled-grid.module";

import {MultipleSelectorComponent} from "./multiple-selector.component";

@NgModule({
	imports: [
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
