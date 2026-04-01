import { NgModule } 		from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } 	from "@angular/forms";

import { AngularMaterialModule } from "../../../modules/angular-material.module";

import { EmailRelatedUsersPopupComponent } from "./email-related-users-popup.component";
import { EmailRelatedUsersService } 			 from "./email-related-users.service";
import { HttpClientModule} from '@angular/common/http';
import {AngularEditorModule} from "@kolkov/angular-editor";

@NgModule({
	imports: [
        AngularMaterialModule,
		CommonModule,
		FormsModule,
    HttpClientModule,
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
