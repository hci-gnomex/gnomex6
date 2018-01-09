import {NgModule} from "@angular/core";
import {REPORTS_ROUTING} from "./reports.routes";
import {AnnotationProgressReportComponent} from "./annotation-progress-report.component";
import {ComboBoxModule} from "../../modules/combobox.module";
import {AngularMaterialModule} from "../../modules/angular-material.module";
import {ProjectExperimentReportComponent} from "./project-experiment-report.component";
import {CommonModule} from "@angular/common";
import {AnnotationReportComponent} from "./annotation-report.component";
import {FormsModule} from "@angular/forms";
import {UtilModule} from "../util/util.module";
import {AgGridModule} from "ag-grid-angular/main";
import {TrackUsageComponent} from "./track-usage.component";
import {ChartsModule} from "ng2-charts";

@NgModule({
    imports: [
        REPORTS_ROUTING,
        CommonModule,
        ComboBoxModule,
        AngularMaterialModule,
        FormsModule,
        UtilModule,
        AgGridModule.withComponents([]),
        ChartsModule,
    ],
    declarations: [
        AnnotationProgressReportComponent,
        ProjectExperimentReportComponent,
        AnnotationReportComponent,
        TrackUsageComponent,
    ],
    exports: [
        AnnotationProgressReportComponent,
        ProjectExperimentReportComponent,
        AnnotationReportComponent,
        TrackUsageComponent,
    ],
})

export class ReportsModule {
}