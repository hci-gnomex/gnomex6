import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import {
    AnalysisPanelComponent,
    AnalysisOverviewComponent,
    AnalysisTab,
    AnalysisVisibleTabComponent,
    AnalysisGroupComponent
} from './index'
import {ANALYSIS_ROUTING} from "../analysis.routes";
import {IconTextRendererComponent} from "../../util/grid-renderers/icon-text-renderer.component";
import {AgGridModule} from "ag-grid-angular";
import {TabsModule} from "../../util/tabs/tabs.module";
import {AngularMaterialModule} from "../../../modules/angular-material.module";
import {UtilModule} from "../../util/util.module";



@NgModule({
    imports: [
        CommonModule,
        ANALYSIS_ROUTING,
        AgGridModule.withComponents([IconTextRendererComponent]),
        TabsModule,
        AngularMaterialModule,
        FormsModule,
        ReactiveFormsModule,
        UtilModule
    ],

    declarations: [
        AnalysisPanelComponent,
        AnalysisOverviewComponent,
        AnalysisTab,
        AnalysisVisibleTabComponent,
        AnalysisGroupComponent
    ],
    providers: [],
    entryComponents: [AnalysisTab,AnalysisVisibleTabComponent,AnalysisGroupComponent],
    exports: [AnalysisPanelComponent]
})
export class AnalysisOverviewModule { }