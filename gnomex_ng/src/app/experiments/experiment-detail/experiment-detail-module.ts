import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

import {AngularEditorModule} from "@kolkov/angular-editor";
import {IconTextRendererComponent} from "../../util/grid-renderers/icon-text-renderer.component";
import {AgGridModule} from "ag-grid-angular";
import {AngularMaterialModule} from "../../../modules/angular-material.module";
import {UtilModule} from "../../util/util.module";
import {RelatedDataModule} from "../../util/related-data.module";
import {DescriptionTabComponent, ExperimentDetailOverviewComponent} from "./index";


import {RichEditorModule} from "../../../modules/index";
import {ExperimentOverviewTabComponent} from "./experiment-overview-tab.component";
import {CollaboratorsDialogComponent} from "./collaborators-dialog.component";
import {ExperimentBioinformaticsTabComponent} from "./experiment-bioinformatics-tab.component";
import {ExperimentFilesTabComponent} from "./experiment-files-tab.component";
import {ManageFilesDialogComponent} from "../../util/upload/manage-files-dialog.component";
import {ManageFilesModule} from "../../util/upload/manage-files.module";
import {MaterialsMethodsTabComponent} from "./materials-methods-tab.component";
import {ProtocolDialogComponent} from "./protocol-dialog.component";
import {ExperimentSequenceLanesTab} from "./experiment-sequence-lanes-tab";
import {AngularSplitModule} from "angular-split";
import {IconRendererComponent} from "../../util/grid-renderers";


@NgModule({
    imports: [
        CommonModule,
        AgGridModule.withComponents([
            IconTextRendererComponent,
            IconRendererComponent,
        ]),
        AngularMaterialModule,
        FormsModule,
        ReactiveFormsModule,
        UtilModule,
        RelatedDataModule,
        RichEditorModule,
        ManageFilesModule,
        AngularSplitModule,
        AngularEditorModule
    ],

    declarations: [
        CollaboratorsDialogComponent,
        ExperimentBioinformaticsTabComponent,
        ExperimentOverviewTabComponent,
        ExperimentDetailOverviewComponent,
        DescriptionTabComponent,
        ExperimentFilesTabComponent,
        MaterialsMethodsTabComponent,
        ProtocolDialogComponent,
        ExperimentSequenceLanesTab,
    ],
    providers: [],
    entryComponents: [
        CollaboratorsDialogComponent,
        ManageFilesDialogComponent,
        ProtocolDialogComponent,
    ],
    exports: [],
})
export class ExperimentDetailModule {
}
