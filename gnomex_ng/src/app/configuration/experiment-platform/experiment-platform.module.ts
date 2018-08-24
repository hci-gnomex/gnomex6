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






@NgModule({
    imports: [
        CONFIGURATION_ROUTING,
        AngularMaterialModule,
        CommonModule,
        FormsModule,
        ServicesModule,
        AgGridModule.withComponents([]),
        UtilModule,
        RichEditorModule,
        ReactiveFormsModule,
        AngularSplitModule,
        DynamicModule.withComponents([ExperimentPlatformTabComponent,
            SortOrderDialogComponent,EpSampleTypeTabComponent,
            EpLibraryPrepTabComponent,ConfigureAnnotationsComponent
        ])

    ],
    declarations: [
        ExperimentPlatformOverviewComponent,
        ExperimentPlatformTabComponent,
        SortOrderDialogComponent,
        EpSampleTypeTabComponent,
        EpLibraryPrepTabComponent


    ],
    entryComponents: [
    ],
    exports: [
    ]

})

export class ExperimentPlatformModule {
}
