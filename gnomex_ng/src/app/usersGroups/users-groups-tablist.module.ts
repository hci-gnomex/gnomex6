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
import {USERS_GROUPS_ROUTING} from "./users-groups.routes";
import {UsersGroupsTablistComponent} from "./users-groups-tablist.component";
import {AgGridModule} from 'ag-grid-angular/main';
import {IconTextRendererComponent} from "../util/grid-renderers/icon-text-renderer.component";
import {NewUserDialogComponent} from "./new-user-dialog.component";
import {DeleteUserDialogComponent} from "./delete-user-dialog.component";
import {NewGroupDialogComponent} from "./new-group-dialog.component";
import {DeleteGroupDialogComponent} from "./delete-group-dialog.component";
import {VerifyUsersDialogComponent} from "./verify-users-dialog.component";
import {BillingAdminTabComponent} from "./billingAdminTab/billing-admin-tab.component";
import {MembershipTabComponent} from "./membershipTab/membership-tab.component";

/**
 * @author jdewell
 * @since 12/19/16
 */

@NgModule({
    imports: [
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
        AgGridModule.withComponents([IconTextRendererComponent])
    ],
    declarations: [UsersGroupsTablistComponent, NewUserDialogComponent, DeleteUserDialogComponent, NewGroupDialogComponent, DeleteGroupDialogComponent, VerifyUsersDialogComponent, BillingAdminTabComponent,
        MembershipTabComponent
    ],
    entryComponents: [NewUserDialogComponent, DeleteUserDialogComponent, NewGroupDialogComponent, DeleteGroupDialogComponent, VerifyUsersDialogComponent],
    exports: [NewUserDialogComponent, DeleteUserDialogComponent, NewGroupDialogComponent, DeleteGroupDialogComponent, VerifyUsersDialogComponent, BillingAdminTabComponent, MembershipTabComponent]
})
export class UsersGroupsTablistModule {
}
