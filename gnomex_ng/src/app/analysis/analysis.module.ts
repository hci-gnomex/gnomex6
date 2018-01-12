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
import { WindowModule }       from "../../modules/window.module";
import {UtilModule} from "../util/util.module";
import {ServicesModule} from "../services/services.module";
import { AngularSplitModule } from 'angular-split';

import {BrowseAnalysisComponent} from "./browse-analysis.component";
import {ANALYSIS_ROUTING} from "./analysis.routes";
import {DeleteAnalysisComponent} from "./delete-analysis.component";
import { AngularMaterialModule} from "../../modules/angular-material.module";
import {MatAutocompleteModule} from "@angular/material";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {DragDropHintComponent} from "./drag-drop-hint.component";
import {CreateAnalysisComponent} from "./create-analysis.component";
import {CreateAnalysisGroupComponent} from "./create-analysis-group.component";
import {DialogsModule} from "../util/popup/dialogs.module";
import {AnalysisOverviewModule} from "./analysis-overview/analysis-overview.module";
import {AnalysisDetailComponent} from "./analysis-detail/analysis-detail.component";

/**
 * @author jdewell
 * @since 12/19/16
 */


@NgModule({
    imports: [
        MatAutocompleteModule,
        AngularMaterialModule,
        DialogsModule,
        BrowserAnimationsModule,
        ANALYSIS_ROUTING,
        ButtonModule,
        CheckBoxModule,
        ComboBoxModule,
        CommonModule,
        EmailRelatedUsersPopupModule,
        ExpanderModule,
        FormsModule,
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
        AnalysisOverviewModule
            ],
    declarations: [
        BrowseAnalysisComponent,
        DeleteAnalysisComponent,
        DragDropHintComponent,
        CreateAnalysisComponent,
        CreateAnalysisGroupComponent,
        AnalysisDetailComponent
    ],
    entryComponents: [DeleteAnalysisComponent, DragDropHintComponent, CreateAnalysisComponent, CreateAnalysisGroupComponent],
    exports: [DeleteAnalysisComponent, DragDropHintComponent, CreateAnalysisComponent, CreateAnalysisGroupComponent]
})
export class AnalysisModule {
}
