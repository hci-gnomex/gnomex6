
/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import { NgModule } 		from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } 	from "@angular/forms";

import { ButtonModule } 	from "../../../modules/button.module";
import { InputModule }    from "../../../modules/input.module";
import { TextAreaModule } from "../../../modules/textarea.module";
import { WindowModule }		from "../../../modules/window.module";

import { EmailRelatedUsersPopupComponent } from "./email-related-users-popup.component";
import { EmailRelatedUsersService } 			 from "./email-related-users.service";

@NgModule({
	imports: [
		ButtonModule,
		CommonModule,
		FormsModule,
		InputModule,
		TextAreaModule,
		WindowModule
	],
	declarations: [
		EmailRelatedUsersPopupComponent
	],
	exports: [
		EmailRelatedUsersPopupComponent
	],
	providers: [
		EmailRelatedUsersService
	]
})
export class EmailRelatedUsersPopupModule {
}
