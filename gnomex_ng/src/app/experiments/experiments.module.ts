import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule,ReactiveFormsModule} from "@angular/forms";

import {EXPERIMENTS_ROUTING} from "./experiments.routes";

import { TreeModule } from "angular-tree-component";

import { AngularMaterialModule } from "../../modules/angular-material.module";
import { EmailRelatedUsersPopupModule } from "../util/emailRelatedUsersPopup/email-related-users-popup.module";
import {UtilModule} from "../util/util.module";
import {ServicesModule} from "../services/services.module";
import { AngularSplitModule } from 'angular-split';

import {BrowseExperimentsComponent} from "./browse-experiments.component";
import {ExperimentOrdersComponent} from "./orders/experiment-orders.component";
import {BrowsePanelComponent} from "./browse-panel.component";
import {AgGridModule} from 'ag-grid-angular/main';
import { DynamicModule } from 'ng-dynamic-component';

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
import {TabNotesViewComponent} from "./new-experiment/tab-notes-view.component";
import {TabSampleSetupViewComponent} from "./new-experiment/tab-sample-setup-view.component";
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
import {TabConfirmIlluminaComponent} from "./new-experiment/tab-confirm-illumina.component";
import {UploadModule} from "../upload/upload.module";
import {NewExperimentSetupComponent} from "./new-experiment/new-experiment-setup.component";
import {ExperimentBioinformaticsTabComponent} from "./experiment-detail/experiment-bioinformatics-tab.component";
import {TabVisibilityComponent} from "./new-experiment/tab-visibility.component";
import {CollaboratorsDialogComponent} from "./experiment-detail/collaborators-dialog.component";
import {ExperimentOverviewTabComponent} from "./experiment-detail/experiment-overview-tab.component";
import {ExperimentDetailOverviewComponent} from "./experiment-detail/experiment-detail-overview.component";
import {DescriptionTabComponent} from "./experiment-detail/description-tab.component";
import {ExperimentFilesTabComponent} from "./experiment-detail/experiment-files-tab.component";
import {MaterialsMethodsTabComponent} from "./experiment-detail/materials-methods-tab.component";
import {ProtocolDialogComponent} from "./experiment-detail/protocol-dialog.component";
import {ExperimentSequenceLanesTab} from "./experiment-detail/experiment-sequence-lanes-tab";
import {ManageFilesDialogComponent} from "../util/upload/manage-files-dialog.component";
import {RelatedDataModule} from "../util/related-data.module";
import {ManageFilesModule} from "../util/upload/manage-files.module";
import {AngularEditorModule} from "@kolkov/angular-editor";
import {ExperimentBillingTabComponent} from "./experiment-detail/experiment-billing-tab.component";
import {LinkButtonRenderer} from "../util/grid-renderers/link-button.renderer";
import {NewExternalExperimentComponent} from "./new-experiment/new-external-experiment.component";
import {TabExternalSetupComponent} from "./new-experiment/tab-external-setup.component";
import {TabExternalDescriptionComponent} from "./new-experiment/tab-external-description.component";
import {AmendExperimentOverviewComponent} from "./amend-experiment-overview.component";
import {TabAmendExperimentSetupComponent} from "./tab-amend-experiment-setup.component";
import {AddAdditionalAccountsComponent} from "./new-experiment/add-additional-accounts.component";
import {CoreSampleSelectorComponent} from "./new-experiment/core-sample-selector.component";
import {ImprovedSelectRenderer} from "../util/grid-renderers/improved-select.renderer";
import {ImprovedSelectEditor} from "../util/grid-editors/improved-select.editor";

@NgModule({
    imports: [
        EXPERIMENTS_ROUTING,
        CommonModule,
        EmailRelatedUsersPopupModule,
        FormsModule,
        ServicesModule,
        TreeModule.forRoot(),
        UtilModule,
        RelatedDataModule,
        ManageFilesModule,
        ReactiveFormsModule,
        AngularMaterialModule,
        AgGridRendererModule,
        AngularSplitModule,
        DynamicModule,
        DynamicModule.withComponents([
            TabNotesViewComponent,
            AnnotationTabComponent,
            TabSampleSetupViewComponent,
            TabSeqSetupViewComponent,
            TabSeqProtoViewComponent,
            TabAnnotationViewComponent,
            TabSamplesIlluminaComponent
        ]),
        AgGridModule.withComponents([
            DateRenderer,
            IconTextRendererComponent,
            IconRendererComponent,
            LinkButtonRenderer,
            MultipleLineTextRenderer,
            ImprovedSelectEditor,
            ImprovedSelectRenderer,
            SelectRenderer,
            TextAlignLeftMiddleRenderer,
            TextAlignRightMiddleRenderer,
            TwoButtonRenderer,
            MultiSelectRenderer,
            UrlAnnotRenderer,
            CheckboxRenderer,
        ]),
        UploadModule,
        AngularEditorModule
    ],
    declarations: [
        BrowseExperimentsComponent,
        ExperimentOrdersComponent,
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
        TabSeqSetupViewComponent,
        TabSeqProtoViewComponent,
        AddAdditionalAccountsComponent,
        NewExperimentComponent,
        NewExperimentSetupComponent,
        TabAnnotationViewComponent,
        TabSamplesIlluminaComponent,
        TabConfirmIlluminaComponent,
        TabVisibilityComponent,
        CollaboratorsDialogComponent,
        ExperimentBioinformaticsTabComponent,
        ExperimentOverviewTabComponent,
        ExperimentDetailOverviewComponent,
        DescriptionTabComponent,
        ExperimentFilesTabComponent,
        MaterialsMethodsTabComponent,
        ProtocolDialogComponent,
        ExperimentSequenceLanesTab,
        ExperimentBillingTabComponent,
        NewExternalExperimentComponent,
        TabExternalSetupComponent,
        TabExternalDescriptionComponent,
        AmendExperimentOverviewComponent,
        TabAmendExperimentSetupComponent,
        CoreSampleSelectorComponent
    ],
    entryComponents: [
        CreateProjectComponent,
        DeleteProjectComponent,
        ReassignExperimentComponent,
        DeleteExperimentComponent,
        CreateProjectLauncherComponent,
        ExperimentBioinformaticsTabComponent,
        TabNotesViewComponent,
        TabSampleSetupViewComponent,
        TabSeqSetupViewComponent,
        AddAdditionalAccountsComponent,
        NewExperimentComponent,
        NewExperimentSetupComponent,
        TabSeqProtoViewComponent,
        TabAnnotationViewComponent,
        TabSamplesIlluminaComponent,
        TabConfirmIlluminaComponent,
        TabVisibilityComponent,
        CollaboratorsDialogComponent,
        ManageFilesDialogComponent,
        ProtocolDialogComponent,
        TabExternalSetupComponent,
        TabExternalDescriptionComponent,
        TabAmendExperimentSetupComponent,
        CoreSampleSelectorComponent
    ],
    exports:[
        CreateProjectComponent,
        DeleteProjectComponent,
        ReassignExperimentComponent,
        DeleteExperimentComponent,
        CreateProjectLauncherComponent,
        TabNotesViewComponent,
        TabSampleSetupViewComponent,
        TabSeqSetupViewComponent,
        AddAdditionalAccountsComponent,
        NewExperimentComponent,
        NewExperimentSetupComponent,
        TabSeqProtoViewComponent,
        TabAnnotationViewComponent,
        TabSamplesIlluminaComponent,
        TabConfirmIlluminaComponent,
        TabVisibilityComponent,
        NewExternalExperimentComponent,
        TabExternalSetupComponent,
        TabExternalDescriptionComponent,
        AmendExperimentOverviewComponent,
        TabAmendExperimentSetupComponent,
        CoreSampleSelectorComponent
    ]
})
export class ExperimentsModule { }
