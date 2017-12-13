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

import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {DialogsModule} from "../util/popup/dialogs.module";
import {BrowseDatatracksComponent} from "./browse-datatracks.component";
import {DATATRACKS_ROUTING} from "./datatracks.routes";
import {AngularMaterialModule} from "../../modules/angular-material.module";
import {UtilModule} from "../util/util.module";
import {MoveDataTrackComponent} from "./move-datatrack.component";

/**
 * @author jdewell
 * @since 12/19/16
 */


@NgModule({
    imports: [
        AngularMaterialModule,
        DialogsModule,
        BrowserAnimationsModule,
        DATATRACKS_ROUTING,
        ButtonModule,
        CheckBoxModule,
        ComboBoxModule,
        CommonModule,
        EmailRelatedUsersPopupModule,
        ExpanderModule,
        FormsModule,
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
        ReactiveFormsModule
    ],
    declarations: [
        BrowseDatatracksComponent, MoveDataTrackComponent
    ],
    entryComponents: [MoveDataTrackComponent],
    exports: [MoveDataTrackComponent]
})
export class DatatracksModule {

}
