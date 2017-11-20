/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule,ReactiveFormsModule} from "@angular/forms";

import {EXPERIMENTS_ROUTING} from "./experiments.routes";

import { TreeModule } from "angular-tree-component";

import { AngularMaterialModule } from "../../modules/angular-material.module";
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

import {BrowseExperimentsComponent} from "./browse-experiments.component";
import {ExperimentOrdersComponent} from "./orders/experiment-orders.component";
import {ViewExperimentComponent} from "./view-experiment.component";
import {BrowsePanelComponent} from "./browse-panel.component";

import {TestComponent,DescriptionTab,PrepTab,ExperimentDetail,NewExperimentComponent} from './experiment-detail/index'
import {
    RichEditorModule,
    DropDownModule
} from '../../modules/index';


import {
    DownloadsBrowseTab,
    ExperimentsBrowseTab,
    ProgressBrowseTab,
    ProjectBrowseTab,
    BrowseOverviewComponent,
    VisiblityBrowseTab
} from "./browse-overview/index"
import {CreateProjectComponent} from "./create-project.component";
import {DeleteProjectComponent} from "./delete-project.component";
import {ReassignExperimentComponent} from "./reassign-experiment.component";
import {DeleteExperimentComponent} from "./delete-experiment.component";
import {DragDropHintComponent} from "../analysis/drag-drop-hint.component";

/**
 * @author mbyrne
 * @since 12/19/16
 */


export const componentFactories =
    [
        TestComponent,
        DescriptionTab,
    PrepTab,
    DownloadsBrowseTab,
    ExperimentsBrowseTab,
    ProgressBrowseTab,
    ProjectBrowseTab,
    VisiblityBrowseTab
    ];
/**/
                                // need add components that will be tabs here
                                                                          // could be put in gnomexFlex as w
@NgModule({
    imports: [
        EXPERIMENTS_ROUTING,
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
        ReactiveFormsModule,
        RichEditorModule,
        DropDownModule,
        AngularMaterialModule
    ],
    declarations: [
                    BrowseExperimentsComponent,
                    ExperimentOrdersComponent,
                    ViewExperimentComponent,
                    TestComponent,
                    DescriptionTab,
                    ExperimentDetail,
                    PrepTab,
                    NewExperimentComponent,
                    DownloadsBrowseTab,
                    BrowsePanelComponent,
                    BrowseOverviewComponent,
                    DownloadsBrowseTab,
                    ExperimentsBrowseTab,
                    ProgressBrowseTab,
                    ProjectBrowseTab,
                    VisiblityBrowseTab,
                    CreateProjectComponent,
                    DeleteProjectComponent,
                    ReassignExperimentComponent,
                    DeleteExperimentComponent
    ],
    entryComponents:[...componentFactories, CreateProjectComponent, DeleteProjectComponent, ReassignExperimentComponent, DeleteExperimentComponent],
    exports:[CreateProjectComponent, DeleteProjectComponent, ReassignExperimentComponent, DeleteExperimentComponent]
})
export class ExperimentsModule {
}
