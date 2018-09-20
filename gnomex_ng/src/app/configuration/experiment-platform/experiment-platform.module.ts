import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TreeModule} from "angular-tree-component";

import {AgGridModule} from "ag-grid-angular";
import {AngularSplitModule} from "angular-split";
import {CONFIGURATION_ROUTING} from "../configuration.routes";
import {AngularMaterialModule} from "../../../modules/angular-material.module";
import {ServicesModule} from "../../services/services.module";
import {CheckboxRenderer} from "../../util/grid-renderers/checkbox.renderer";
import {DateEditor} from "../../util/grid-editors/date.editor";
import {DateRenderer} from "../../util/grid-renderers/date.renderer";
import {UtilModule} from "../../util/util.module";
import {RichEditorModule} from "../../../modules";
import {ExperimentPlatformOverviewComponent} from "./experiment-platform-overview.component";
import {ExperimentPlatformTabComponent} from "./experiment-platform-tab.component";
import {EpSampleTypeTabComponent} from "./ep-sample-type-tab.component";
import {SortOrderDialogComponent} from "./sort-order-dialog.component";
import {EpLibraryPrepTabComponent} from "./ep-library-prep-tab.component";
import {ConfigureAnnotationsComponent} from "../../util/configure-annotations.component";
import { DynamicModule } from 'ng-dynamic-component';
import {AgGridRendererModule, IconTextRendererComponent} from "../../util/grid-renderers";
import {IconLinkButtonRenderer} from "../../util/grid-renderers/icon-link-button.renderer";
import {SampleTypeDetailDialogComponent} from "./sample-type-detail-dialog.component";
import {DialogsModule} from "../../util/popup/dialogs.module";
import {SelectEditor} from "../../util/grid-editors/select.editor";
import {SelectRenderer} from "../../util/grid-renderers/select.renderer";
import {EpPipelineProtocolTabComponent} from "./ep-pipeline-protocol-tab.component";
import {EpIlluminaSeqTabComponent} from "./ep-illumina-seq-tab.component";
import {IlluminaSeqDialogComponent} from "./illumina-seq-dialog.component";
import {AddExperimentPlatformDialogComponent} from "./add-experiment-platform-dialog.component";






@NgModule({
    imports: [
        CONFIGURATION_ROUTING,
        AngularMaterialModule,
        CommonModule,
        FormsModule,
        ServicesModule,
        AgGridRendererModule,
        AgGridModule.withComponents([
            SelectEditor,
            SelectRenderer,
            CheckboxRenderer,
            IconLinkButtonRenderer,
            IconTextRendererComponent
        ]),
        UtilModule,
        RichEditorModule,
        ReactiveFormsModule,
        AngularSplitModule,
        DynamicModule.withComponents([ExperimentPlatformTabComponent,
            EpSampleTypeTabComponent,
            EpLibraryPrepTabComponent,ConfigureAnnotationsComponent,
            EpPipelineProtocolTabComponent,
            EpIlluminaSeqTabComponent
        ])

    ],
    declarations: [
        ExperimentPlatformOverviewComponent,
        ExperimentPlatformTabComponent,
        EpSampleTypeTabComponent,
        EpLibraryPrepTabComponent,
        SampleTypeDetailDialogComponent,
        SortOrderDialogComponent,
        EpPipelineProtocolTabComponent,
        EpIlluminaSeqTabComponent,
        IlluminaSeqDialogComponent,
        AddExperimentPlatformDialogComponent,



    ],
    entryComponents: [
        SampleTypeDetailDialogComponent,
        SortOrderDialogComponent,
        IlluminaSeqDialogComponent,
        AddExperimentPlatformDialogComponent

    ],
    exports: [
    ]

})

export class ExperimentPlatformModule {
}
