import { NgModule } 		from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } 	from "@angular/forms";

import { AngularMaterialModule } from "../../../modules/angular-material.module";

import { EmailRelatedUsersPopupComponent } from "./email-related-users-popup.component";
import { EmailRelatedUsersService } 			 from "./email-related-users.service";
import {AngularEditorModule} from "@kolkov/angular-editor";

@NgModule({
	imports: [
        AngularMaterialModule,
		CommonModule,
		FormsModule,
        AngularEditorModule
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
