/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {NgModule} from "@angular/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

import {AgGridModule} from 'ag-grid-angular/main';
import {AgGridEditorModule} from "../util/grid-editors/ag-grid-editor.module";
import {AgGridRendererModule} from "../util/grid-renderers/ag-grid-renderer.module";

import {AngularSplitModule} from 'angular-split';

import {TreeModule} from "angular-tree-component";

import {AngularMaterialModule} from "../../modules/angular-material.module";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {DialogsModule} from "../util/popup/dialogs.module";
import {EditBillingAccountModule} from "../billing/edit_billing_account/edit-billing-account.module";
import {ServicesModule} from "../services/services.module";
import {UtilModule} from "../util/util.module";

import { ApproveButtonRenderer } from "../util/grid-renderers/approve-button.renderer";
import { CheckboxRenderer } from "../util/grid-renderers/checkbox.renderer";
import { DateEditor } from "../util/grid-editors/date.editor";
import { DateRenderer } from "../util/grid-renderers/date.renderer";
import { IconLinkButtonRenderer } from "../util/grid-renderers/icon-link-button.renderer";
import { SplitStringToMultipleLinesRenderer } from "../util/grid-renderers/split-string-to-multiple-lines.renderer";
import { RemoveLinkButtonRenderer } from "../util/grid-renderers/remove-link-button.renderer";
import { SelectEditor } from "../util/grid-editors/select.editor";
import { SelectRenderer } from "../util/grid-renderers/select.renderer";
import { TextAlignLeftMiddleRenderer } from "../util/grid-renderers/text-align-left-middle.renderer";
import { TextAlignRightMiddleRenderer } from "../util/grid-renderers/text-align-right-middle.renderer";
import { UploadViewRemoveRenderer } from "../util/grid-renderers/upload-view-remove.renderer";

import { BillingAccountTabComponent } from "./billingAccountTab/billing-account-tab.component";
import { BillingAdminTabComponent } from "./billingAdminTab/billing-admin-tab.component";
import { BillingUsersSelectorComponent } from "./billingAccountTab/billingUsersSelector/billing-users-selector.component";
import { InvoicesTabComponent } from "./invoicesTab/invoices-tab.component";
import { MembershipTabComponent } from "./membershipTab/membership-tab.component";
import { NewGroupDialogComponent } from "./new-group-dialog.component";
import { NewUserDialogComponent } from "./new-user-dialog.component";
import { DeleteGroupDialogComponent } from "./delete-group-dialog.component";
import { DeleteUserDialogComponent } from "./delete-user-dialog.component";
import { UsersGroupsTablistComponent } from "./users-groups-tablist.component";
import { VerifyUsersDialogComponent } from "./verify-users-dialog.component";
import { USERS_GROUPS_ROUTING } from "./users-groups.routes";

import {AccountFieldsConfigurationService} from "../services/account-fields-configuration.service";
import {TextAlignLeftMiddleEditor} from "../util/grid-editors/text-align-left-middle.editor";
import {TextAlignRightMiddleEditor} from "../util/grid-editors/text-align-right-middle.editor";

/**
 * @author jdewell
 * @since 12/19/16
 */

@NgModule({
    imports: [
        AgGridEditorModule,
        AgGridModule.withComponents([
            ApproveButtonRenderer,
            CheckboxRenderer,
            DateEditor,
            DateRenderer,
            IconLinkButtonRenderer,
            RemoveLinkButtonRenderer,
            SelectEditor,
            SelectRenderer,
            SplitStringToMultipleLinesRenderer,
            TextAlignLeftMiddleEditor,
            TextAlignLeftMiddleRenderer,
            TextAlignRightMiddleEditor,
            TextAlignRightMiddleRenderer,
            UploadViewRemoveRenderer
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
        BillingUsersSelectorComponent,
        DeleteGroupDialogComponent,
        DeleteUserDialogComponent,
        MembershipTabComponent,
        NewGroupDialogComponent,
        NewUserDialogComponent,
        UsersGroupsTablistComponent,
        VerifyUsersDialogComponent,
        InvoicesTabComponent
    ],
    entryComponents: [
        BillingUsersSelectorComponent,
        DeleteGroupDialogComponent,
        DeleteUserDialogComponent,
        NewGroupDialogComponent,
        NewUserDialogComponent,
        VerifyUsersDialogComponent,
        InvoicesTabComponent
    ],
    providers: [
        AccountFieldsConfigurationService
    ],
    exports: [
        BillingAdminTabComponent,
        BillingUsersSelectorComponent,
        DeleteGroupDialogComponent,
        DeleteUserDialogComponent,
        MembershipTabComponent,
        NewGroupDialogComponent,
        NewUserDialogComponent,
        VerifyUsersDialogComponent,
    ]
})
export class UsersGroupsTablistModule {
}
