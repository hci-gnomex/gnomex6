/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule,ReactiveFormsModule} from "@angular/forms";

import { TreeModule } from "angular-tree-component";
import { EmailRelatedUsersPopupModule } from "../util/emailRelatedUsersPopup/email-related-users-popup.module";
import {ServicesModule} from "../services/services.module";
import { AngularSplitModule } from 'angular-split';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {DialogsModule} from "../util/popup/dialogs.module";
import {BrowseDatatracksComponent} from "./browse-datatracks.component";
import {DATATRACKS_ROUTING} from "./datatracks.routes";
import {AngularMaterialModule} from "../../modules/angular-material.module";
import {UtilModule} from "../util/util.module";
import {MoveDataTrackComponent} from "./move-datatrack.component";
import {DatatracksOverviewModule} from "./datatracks-overview/datatracks-overview.module"
import {DatatracksDetailModule} from "./datatracks-detail/datatracks-detail.module";

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
        CommonModule,
        EmailRelatedUsersPopupModule,
        FormsModule,
        ServicesModule,
        TreeModule.forRoot(),
        UtilModule,
        ReactiveFormsModule,
        AngularSplitModule,
        DatatracksOverviewModule,
        DatatracksDetailModule
    ],
    declarations: [
        BrowseDatatracksComponent, MoveDataTrackComponent
    ],
    entryComponents: [MoveDataTrackComponent],
    exports: [MoveDataTrackComponent]
})
export class DatatracksModule {
}
