import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import {
    AnalysisDetailOverviewComponent
} from './index'
import {ANALYSIS_ROUTING} from "../analysis.routes";
import {IconTextRendererComponent} from "../../util/grid-renderers/icon-text-renderer.component";
import {AgGridModule} from "ag-grid-angular";
import {AngularMaterialModule} from "../../../modules/angular-material.module";
import {UtilModule} from "../../util/util.module";
import {TreeModule} from "angular-tree-component";



@NgModule({
    imports: [
        CommonModule,
        AgGridModule.withComponents([IconTextRendererComponent]),
        AngularMaterialModule,
        FormsModule,
        ReactiveFormsModule,
        TreeModule,
        UtilModule
    ],

    declarations: [
        AnalysisDetailOverviewComponent
    ],
    providers: [],
    entryComponents: [],
    exports: []
})
export class AnalysisDetailModule { }