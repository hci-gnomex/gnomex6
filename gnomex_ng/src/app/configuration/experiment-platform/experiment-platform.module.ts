import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AgGridModule} from "ag-grid-angular";
import {AngularSplitModule} from "angular-split";
import {CONFIGURATION_ROUTING} from "../configuration.routes";
import {AngularMaterialModule} from "../../../modules/angular-material.module";
import {ServicesModule} from "../../services/services.module";
import {CheckboxRenderer} from "../../util/grid-renderers/checkbox.renderer";
import {UtilModule} from "../../util/util.module";
import {RichEditorModule} from "../../../modules";
import {ExperimentPlatformOverviewComponent} from "./experiment-platform-overview.component";
import {ExperimentPlatformTabComponent} from "./experiment-platform-tab.component";
import {EpSampleTypeTabComponent} from "./ep-sample-type-tab.component";
import {SortOrderDialogComponent} from "./sort-order-dialog.component";
import {ConfigureAnnotationsComponent} from "../../util/configure-annotations.component";
import { DynamicModule } from 'ng-dynamic-component';
import {AgGridRendererModule, IconTextRendererComponent} from "../../util/grid-renderers";
import {IconLinkButtonRenderer} from "../../util/grid-renderers/icon-link-button.renderer";
import {SampleTypeDetailDialogComponent} from "./sample-type-detail-dialog.component";
import {SelectEditor} from "../../util/grid-editors/select.editor";
import {SelectRenderer} from "../../util/grid-renderers/select.renderer";
import {EpPipelineProtocolTabComponent} from "./ep-pipeline-protocol-tab.component";
import {EpIlluminaSeqTabComponent} from "./ep-illumina-seq-tab.component";
import {IlluminaSeqDialogComponent} from "./illumina-seq-dialog.component";
import {AddExperimentPlatformDialogComponent} from "./add-experiment-platform-dialog.component";
import {EpLibraryPrepQCTabComponent} from "./ep-library-prep-qc-tab.component";
import {EpPrepTypesTabComponent} from "./ep-prep-types-tab.component";
import {PrepTypePricingDialogComponent} from "./prep-type-pricing-dialog.component";
import {EpExperimentTypeTabComponent} from "./ep-experiment-type-tab.component";
import {EpExperimentTypeIlluminaTabComponent} from "./ep-experiment-type-illumina-tab.component";
import {LibraryPrepDialogComponent} from "./library-prep-dialog.component";
import {LibraryPrepProtocolDialogComponent} from "./library-prep-protocol-dialog.component";
import {LibraryPrepStepsDialogComponent} from "./library-prep-steps-dialog.component";






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
            ConfigureAnnotationsComponent,
            EpPipelineProtocolTabComponent,
            EpIlluminaSeqTabComponent,
            EpLibraryPrepQCTabComponent,
            EpPrepTypesTabComponent,
            EpExperimentTypeTabComponent,
            EpExperimentTypeIlluminaTabComponent
        ])

    ],
    declarations: [
        ExperimentPlatformOverviewComponent,
        ExperimentPlatformTabComponent,
        EpSampleTypeTabComponent,
        SampleTypeDetailDialogComponent,
        SortOrderDialogComponent,
        EpPipelineProtocolTabComponent,
        EpIlluminaSeqTabComponent,
        IlluminaSeqDialogComponent,
        AddExperimentPlatformDialogComponent,
        EpLibraryPrepQCTabComponent,
        EpPrepTypesTabComponent,
        PrepTypePricingDialogComponent,
        EpExperimentTypeTabComponent,
        EpExperimentTypeIlluminaTabComponent,
        LibraryPrepDialogComponent,
        LibraryPrepProtocolDialogComponent,
        LibraryPrepStepsDialogComponent





    ],
    entryComponents: [
        SampleTypeDetailDialogComponent,
        SortOrderDialogComponent,
        IlluminaSeqDialogComponent,
        AddExperimentPlatformDialogComponent,
        PrepTypePricingDialogComponent,
        LibraryPrepDialogComponent,
        LibraryPrepProtocolDialogComponent,
        LibraryPrepStepsDialogComponent

    ],
    exports: [
    ]

})

export class ExperimentPlatformModule {
}
