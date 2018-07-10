import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import {
    AnalysisDetailOverviewComponent,
    AnalysisExperimentTabComponent
} from './index'
import {IconTextRendererComponent} from "../../util/grid-renderers/icon-text-renderer.component";
import {AgGridModule} from "ag-grid-angular";
import {AngularMaterialModule} from "../../../modules/angular-material.module";
import {UtilModule} from "../../util/util.module";
import {RelatedDataModule} from "../../util/related-data.module";
import {AngularSplitModule} from "angular-split";
import {TreeModule} from "angular-tree-component";



@NgModule({
    imports: [
        CommonModule,
        AgGridModule.withComponents([IconTextRendererComponent]),
        AngularMaterialModule,
        FormsModule,
        TreeModule,
        ReactiveFormsModule,
        UtilModule,
        RelatedDataModule,
        AngularSplitModule
    ],

    declarations: [
        AnalysisDetailOverviewComponent,
        AnalysisExperimentTabComponent
    ],
    providers: [],
    entryComponents: [],
    exports: []
})
export class AnalysisDetailModule { }