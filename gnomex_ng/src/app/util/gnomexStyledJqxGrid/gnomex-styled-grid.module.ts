import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";

import { JqxGridModule }      from "../../../modules/jqxgrid.module";

import {GnomexStyledGridComponent} from "./gnomex-styled-grid.component"

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		JqxGridModule
	],
	declarations: [
		GnomexStyledGridComponent
	],
	exports: [
		GnomexStyledGridComponent
	]
})
export class GnomexStyledGridModule {
}
