import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import {
    AnalysisDetailOverviewComponent,
    AnalysisExperimentTabComponent,
    LinkToExperimentDialogComponent
} from './index'
import {IconTextRendererComponent} from "../../util/grid-renderers/icon-text-renderer.component";
import {AgGridModule} from "ag-grid-angular";
import {AngularMaterialModule} from "../../../modules/angular-material.module";
import {UtilModule} from "../../util/util.module";
import {RelatedDataModule} from "../../util/related-data.module";
import {AngularSplitModule} from "angular-split";
import {TreeModule} from "angular-tree-component";
import {AnalysisInfoTabComponent} from "./analysis-info-tab.component";
import {AnalysisFilesTabComponent} from "./analysis-files-tab.component";
import {ViewerLinkRenderer} from "../../util/grid-renderers/viewer-link.renderer";
import {ManageFilesModule} from "../../util/upload/manage-files.module";
import {ManageFilesDialogComponent} from "../../util/upload/manage-files-dialog.component";



@NgModule({
    imports: [
        CommonModule,
        AgGridModule.withComponents([
            IconTextRendererComponent,
            ViewerLinkRenderer,
        ]),
        AngularMaterialModule,
        FormsModule,
        TreeModule.forRoot(),
        ReactiveFormsModule,
        UtilModule,
        RelatedDataModule,
        AngularSplitModule,
        ManageFilesModule
    ],

    declarations: [
        AnalysisDetailOverviewComponent,
        AnalysisExperimentTabComponent,
        LinkToExperimentDialogComponent,
        AnalysisInfoTabComponent,
        AnalysisFilesTabComponent
    ],
    providers: [],
    entryComponents: [
        LinkToExperimentDialogComponent,
        ManageFilesDialogComponent
    ],
    exports: []
})
export class AnalysisDetailModule { }