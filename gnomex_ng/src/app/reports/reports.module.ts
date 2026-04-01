import {NgModule} from "@angular/core";
import {REPORTS_ROUTING} from "./reports.routes";
import {AnnotationProgressReportComponent} from "./annotation-progress-report.component";
import {AngularMaterialModule} from "../../modules/angular-material.module";
import {ProjectExperimentReportComponent} from "./project-experiment-report.component";
import {CommonModule} from "@angular/common";
import {AnnotationReportComponent} from "./annotation-report.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {UtilModule} from "../util/util.module";
import {AgGridModule} from "ag-grid-angular";
import {TrackUsageComponent} from "./track-usage.component";
import {ChartsModule} from "ng2-charts";
import {EmailAllUsersComponent} from "./email-all-users.component";
import { HttpClientModule} from '@angular/common/http';
import {AngularEditorModule} from "@kolkov/angular-editor";
import {AngularSplitModule} from "angular-split";
import {TrackUsageDetailComponent} from "./track-usage-detail.component";
import {AccessibilityModule} from "../util/accessibility/accessibility.module";

@NgModule({
    imports: [
        REPORTS_ROUTING,
        CommonModule,
        AngularMaterialModule,
        FormsModule,
        UtilModule,
        AgGridModule.withComponents([]),
        ChartsModule,
        ReactiveFormsModule,
        HttpClientModule,
        AngularEditorModule,
        AngularSplitModule,
        AccessibilityModule
    ],
    declarations: [
        AnnotationProgressReportComponent,
        ProjectExperimentReportComponent,
        AnnotationReportComponent,
        TrackUsageComponent,
        EmailAllUsersComponent,
        TrackUsageDetailComponent,
    ],
    exports: [
        AnnotationProgressReportComponent,
        ProjectExperimentReportComponent,
        AnnotationReportComponent,
        TrackUsageComponent,
        TrackUsageDetailComponent,
    ],
    entryComponents: [
        EmailAllUsersComponent,
        TrackUsageDetailComponent,
    ],
})

export class ReportsModule {
}
