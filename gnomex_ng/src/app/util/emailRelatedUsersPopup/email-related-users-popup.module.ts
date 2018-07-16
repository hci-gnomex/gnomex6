
/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import { NgModule } 		from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } 	from "@angular/forms";

import { AngularMaterialModule } from "../../../modules/angular-material.module";

import { EmailRelatedUsersPopupComponent } from "./email-related-users-popup.component";
import { EmailRelatedUsersService } 			 from "./email-related-users.service";

@NgModule({
	imports: [
        AngularMaterialModule,
		CommonModule,
		FormsModule
	],
	declarations: [
		EmailRelatedUsersPopupComponent
	],
	exports: [
		EmailRelatedUsersPopupComponent
	],
	entryComponents: [
        EmailRelatedUsersPopupComponent
	],
	providers: [
		EmailRelatedUsersService
	]
})
export class EmailRelatedUsersPopupModule {
}
