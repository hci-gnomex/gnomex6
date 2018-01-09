import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";

import {TESTPAGE_ROUTING} from "./test-page.routes";

import {AngularMaterialModule} from "../../modules/angular-material.module";

import {TestPageComponent} from "./test-page.component";
import {TestingDialogComponent} from "./testing-dialog.component";

@NgModule({
	imports: [
		TESTPAGE_ROUTING,
		AngularMaterialModule,
		BrowserModule,
		CommonModule,
		FormsModule
	],
	declarations: [
		TestingDialogComponent,
		TestPageComponent
	],
	entryComponents: [
		TestingDialogComponent
	],
	exports: [
		TestingDialogComponent,
		TestPageComponent
	]
})
export class TestPageModule {
}
