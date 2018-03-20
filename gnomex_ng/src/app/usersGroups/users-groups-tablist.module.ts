/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import { NgModule} from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { AgGridModule } from 'ag-grid-angular/main';
import { AgGridEditorModule } from "../util/grid-editors/ag-grid-editor.module";
import { AgGridRendererModule } from "../util/grid-renderers/ag-grid-renderer.module";

import { AngularSplitModule } from 'angular-split';

import { TreeModule } from "angular-tree-component";

import { AngularMaterialModule } from "../../modules/angular-material.module";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { DialogsModule } from "../util/popup/dialogs.module";
import { EditBillingAccountModule } from "../billing/edit_billing_account/edit-billing-account.module";
import { ServicesModule } from "../services/services.module";
import { UtilModule } from "../util/util.module";

import { CheckboxRenderer } from "../util/grid-renderers/checkbox.renderer";
import { IconLinkButtonRenderer } from "../util/grid-renderers/icon-link-button.renderer";
import { RemoveLinkButtonRenderer } from "../util/grid-renderers/remove-link-button.renderer";
import { SelectEditor } from "../util/grid-editors/select.editor";
import { SelectRenderer } from "../util/grid-renderers/select.renderer";
import { TextAlignLeftMiddleRenderer } from "../util/grid-renderers/text-align-left-middle.renderer";
import { TextAlignRightMiddleRenderer } from "../util/grid-renderers/text-align-right-middle.renderer";
import { UploadViewRemoveRenderer } from "../util/grid-renderers/upload-view-remove.renderer";

import { BillingAccountTabComponent } from "./billingAccountTab/billing-account-tab.component";
import { BillingAdminTabComponent } from "./billingAdminTab/billing-admin-tab.component";
import { MembershipTabComponent } from "./membershipTab/membership-tab.component";
import { NewGroupDialogComponent } from "./new-group-dialog.component";
import { NewUserDialogComponent } from "./new-user-dialog.component";
import { DeleteGroupDialogComponent } from "./delete-group-dialog.component";
import { DeleteUserDialogComponent } from "./delete-user-dialog.component";
import { UsersGroupsTablistComponent } from "./users-groups-tablist.component";
import { VerifyUsersDialogComponent } from "./verify-users-dialog.component";
import { USERS_GROUPS_ROUTING } from "./users-groups.routes";
/**
 * @author jdewell
 * @since 12/19/16
 */

@NgModule({
    imports: [
			  AgGridEditorModule,
			  AgGridModule.withComponents([
			  	  TextAlignLeftMiddleRenderer,
			  	  RemoveLinkButtonRenderer,
			  	  CheckboxRenderer,
			  	  IconLinkButtonRenderer,
			  	  UploadViewRemoveRenderer,
			  	  SelectEditor,
			  	  SelectRenderer,
			  	  TextAlignRightMiddleRenderer
			  ]),
			  AgGridRendererModule,
			  AngularMaterialModule,
			  AngularSplitModule,
			  BrowserAnimationsModule,
			  DialogsModule,
			  EditBillingAccountModule,
			  FormsModule,
			  ReactiveFormsModule,
			  ServicesModule,
			  TreeModule,
			  USERS_GROUPS_ROUTING,
			  UtilModule
    ],
    declarations: [
        BillingAccountTabComponent,
			  BillingAdminTabComponent,
        DeleteGroupDialogComponent,
        DeleteUserDialogComponent,
			  MembershipTabComponent,
        NewGroupDialogComponent,
        NewUserDialogComponent,
        UsersGroupsTablistComponent,
        VerifyUsersDialogComponent
    ],
    entryComponents: [
        DeleteGroupDialogComponent,
        DeleteUserDialogComponent,
			  NewGroupDialogComponent,
			  NewUserDialogComponent,
        VerifyUsersDialogComponent
    ],
    exports: [
			  BillingAdminTabComponent,
			  DeleteGroupDialogComponent,
			  DeleteUserDialogComponent,
			  MembershipTabComponent ,
			  NewGroupDialogComponent,
			  NewUserDialogComponent,
			  VerifyUsersDialogComponent,
    ]
})
export class UsersGroupsTablistModule {
}
