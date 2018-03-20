/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule,ReactiveFormsModule} from "@angular/forms";

import { TreeModule } from "angular-tree-component";

import { ButtonModule } from "../../modules/button.module";
import { CheckBoxModule} from "../../modules/checkbox.module";
import { ComboBoxModule }     from "../../modules/combobox.module";
import { EmailRelatedUsersPopupModule } from "../util/emailRelatedUsersPopup/email-related-users-popup.module";
import { ExpanderModule }     from "../../modules/expander.module";
import { GnomexStyledGridModule } from "../util/gnomexStyledJqxGrid/gnomex-styled-grid.module";
import { InputModule } from "../../modules/input.module";
import { LoaderModule }       from "../../modules/loader.module";
import { PanelModule }        from "../../modules/panel.module";
import { NotificationModule } from "../../modules/notification.module";
import { TextAreaModule }     from "../../modules/textarea.module";
import { ToggleButtonModule } from "../../modules/togglebutton.module";
import {WindowModule}       from "../../modules/window.module";
import {ServicesModule} from "../services/services.module";
import { AngularSplitModule } from 'angular-split';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {DialogsModule} from "../util/popup/dialogs.module";
import {AngularMaterialModule} from "../../modules/angular-material.module";
import {UtilModule} from "../util/util.module";

import {AgGridModule} from 'ag-grid-angular/main';
import {AgGridEditorModule} from "../util/grid-editors/ag-grid-editor.module";
import {AgGridRendererModule} from "../util/grid-renderers/ag-grid-renderer.module";

import { CheckboxRenderer } from "../util/grid-renderers/checkbox.renderer";
import { IconLinkButtonRenderer } from "../util/grid-renderers/icon-link-button.renderer";
import { RemoveLinkButtonRenderer } from "../util/grid-renderers/remove-link-button.renderer";
import { SelectEditor } from "../util/grid-editors/select.editor";
import { SelectRenderer } from "../util/grid-renderers/select.renderer";
import { TextAlignLeftMiddleRenderer } from "../util/grid-renderers/text-align-left-middle.renderer";
import { TextAlignRightMiddleRenderer } from "../util/grid-renderers/text-align-right-middle.renderer";
import { UploadViewRemoveRenderer } from "../util/grid-renderers/upload-view-remove.renderer";

import {USERS_GROUPS_ROUTING} from "./users-groups.routes";
import {UsersGroupsTablistComponent} from "./users-groups-tablist.component";
import {IconTextRendererComponent} from "../util/grid-renderers/icon-text-renderer.component";
import {NewUserDialogComponent} from "./new-user-dialog.component";
import {DeleteUserDialogComponent} from "./delete-user-dialog.component";
import {NewGroupDialogComponent} from "./new-group-dialog.component";
import {DeleteGroupDialogComponent} from "./delete-group-dialog.component";
import {VerifyUsersDialogComponent} from "./verify-users-dialog.component";
import {BillingAccountTabComponent} from "./billingAccountTab/billing-account-tab.component";
import {BillingAdminTabComponent} from "./billingAdminTab/billing-admin-tab.component";
import {MembershipTabComponent} from "./membershipTab/membership-tab.component";
/**
 * @author jdewell
 * @since 12/19/16
 */

@NgModule({
    imports: [
			  AgGridEditorModule,
			  AgGridRendererModule,
        AngularMaterialModule,
        DialogsModule,
        BrowserAnimationsModule,
        USERS_GROUPS_ROUTING,
        ButtonModule,
        CheckBoxModule,
        ComboBoxModule,
        CommonModule,
        EmailRelatedUsersPopupModule,
        ExpanderModule,
        FormsModule,
        ReactiveFormsModule,
        GnomexStyledGridModule,
        InputModule,
        LoaderModule,
        NotificationModule,
        PanelModule,
        ServicesModule,
        TextAreaModule,
        ToggleButtonModule,
        TreeModule,
        UtilModule,
        WindowModule,
        ReactiveFormsModule,
        AngularSplitModule,
        AgGridModule.withComponents([
					  TextAlignLeftMiddleRenderer,
            RemoveLinkButtonRenderer,
            CheckboxRenderer,
					  IconLinkButtonRenderer,
            IconTextRendererComponent,
					  UploadViewRemoveRenderer,
					  SelectEditor,
					  SelectRenderer,
					  TextAlignRightMiddleRenderer
        ])
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
