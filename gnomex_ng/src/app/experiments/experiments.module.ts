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
import { TreeGridModule } from "../../modules/tree-grid.module";
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

import {BrowseExperimentsComponent} from "./browse-experiments.component";
import {ExperimentOrdersComponent} from "./orders/experiment-orders.component";
import {ViewExperimentComponent} from "./view-experiment.component";
import {BrowsePanelComponent} from "./browse-panel.component";
import {AgGridModule} from 'ag-grid-angular/main';
import { DynamicModule } from 'ng-dynamic-component';


import {
    DropDownModule
} from '../../modules/index';

import {
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
import {AgGridRendererModule,IconTextRendererComponent} from "../util/grid-renderers/index";
import {CreateProjectLauncherComponent} from "./create-project-launcher-component";
import {IconRendererComponent} from "../util/grid-renderers/icon-renderer.component";
import {ExperimentDetailModule} from "./experiment-detail/experiment-detail-module";
import {TabNotesViewComponent} from "./new-experiment/tab-notes-view.component";
import {TabSampleSetupViewComponent} from "./new-experiment/tab-sample-setup-view.component";
import {TabPropertiesViewComponent} from "./new-experiment/tab-properties-view.component";
import {TabSeqSetupViewComponent} from "./new-experiment/tab-seq-setup-view.component";
import {NewExperimentComponent} from "./new-experiment/new-experiment.component";
import {AnnotationTabComponent} from "../util/annotation-tab.component";
import {TabSeqProtoViewComponent} from "./new-experiment/tab-seq-proto-view.component";
import {TextAlignLeftMiddleRenderer} from "../util/grid-renderers/text-align-left-middle.renderer";
import {TextAlignRightMiddleRenderer} from "../util/grid-renderers/text-align-right-middle.renderer";
import {DateRenderer} from "../util/grid-renderers/date.renderer";
import {TwoButtonRenderer} from "../util/grid-renderers/two-button.renderer";
import {MultipleLineTextRenderer} from "../util/grid-renderers/multiple-line-text.renderer";
import {SelectRenderer} from "../util/grid-renderers/select.renderer";
import {TabAnnotationViewComponent} from "./new-experiment/tab-annotation-view.component";
import {TabSamplesIlluminaComponent} from "./new-experiment/tab-samples-illumina.component";
import {MultiSelectRenderer} from "../util/grid-renderers/multi-select.renderer";
import {UrlAnnotRenderer} from "../util/grid-renderers/url-annot-renderer";
import {CheckboxRenderer} from "../util/grid-renderers/checkbox.renderer";
import {RouterModule} from "@angular/router";
import {TabBioinformaticsViewComponent} from "./new-experiment/tab-bioinformatics-view.component";
import {TabConfirmIlluminaComponent} from "./new-experiment/tab-confirm-illumina.component";
import {UploadModule} from "../upload/upload.module";
import {VisibilityDetailTabComponent} from "../util/visibility-detail-tab.component";
// import {V} from "@angular/core/src/render3";

/**
 * @author mbyrne
 * @since 12/19/16
 */


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
        DropDownModule,
        AngularMaterialModule,
        TreeGridModule,
        AgGridRendererModule,
        AngularSplitModule,
        DynamicModule,
        DynamicModule.withComponents([TabNotesViewComponent, AnnotationTabComponent, TabSampleSetupViewComponent, TabSeqSetupViewComponent,
            TabSeqProtoViewComponent, TabAnnotationViewComponent, TabSamplesIlluminaComponent]),
        AgGridModule.withComponents([
            DateRenderer,
            IconTextRendererComponent,
            IconRendererComponent,
            MultipleLineTextRenderer,
            SelectRenderer,
            TextAlignLeftMiddleRenderer,
            TextAlignRightMiddleRenderer,
            TwoButtonRenderer,
            MultiSelectRenderer,
            UrlAnnotRenderer,
            CheckboxRenderer,
        ]),
        ExperimentDetailModule,
        UploadModule
    ],
    declarations: [
                    BrowseExperimentsComponent,
                    ExperimentOrdersComponent,
                    ViewExperimentComponent,
                    BrowsePanelComponent,
                    BrowseOverviewComponent,
                    ExperimentsBrowseTab,
                    ProgressBrowseTab,
                    ProjectBrowseTab,
                    VisiblityBrowseTab,
                    CreateProjectComponent,
                    DeleteProjectComponent,
                    ReassignExperimentComponent,
                    DeleteExperimentComponent,
                    CreateProjectLauncherComponent,
                    TabNotesViewComponent,
                    TabSampleSetupViewComponent,
                    TabPropertiesViewComponent,
        TabSeqSetupViewComponent,
        TabSeqProtoViewComponent,
                    NewExperimentComponent,
                    TabAnnotationViewComponent,
                    TabSamplesIlluminaComponent,
                    TabBioinformaticsViewComponent,
                    TabConfirmIlluminaComponent
    ],
    entryComponents:[CreateProjectComponent, DeleteProjectComponent, ReassignExperimentComponent, DeleteExperimentComponent, CreateProjectLauncherComponent, TabNotesViewComponent, TabSampleSetupViewComponent, TabPropertiesViewComponent, TabSeqSetupViewComponent, NewExperimentComponent,
        TabSeqProtoViewComponent, TabAnnotationViewComponent, TabSamplesIlluminaComponent, TabBioinformaticsViewComponent, TabConfirmIlluminaComponent, VisibilityDetailTabComponent],
    exports:[CreateProjectComponent, DeleteProjectComponent, ReassignExperimentComponent, DeleteExperimentComponent, CreateProjectLauncherComponent, TabNotesViewComponent, TabSampleSetupViewComponent, TabPropertiesViewComponent, TabSeqSetupViewComponent, NewExperimentComponent,
        TabSeqProtoViewComponent, TabAnnotationViewComponent, TabSamplesIlluminaComponent, TabBioinformaticsViewComponent, TabConfirmIlluminaComponent, VisibilityDetailTabComponent]
})
export class ExperimentsModule {
}
