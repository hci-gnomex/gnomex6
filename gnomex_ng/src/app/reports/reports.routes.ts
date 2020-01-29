import {RouterModule, Routes} from "@angular/router";
import {AnnotationProgressReportComponent} from "./annotation-progress-report.component";
import {ProjectExperimentReportComponent} from "./project-experiment-report.component";
import {AnnotationReportComponent} from "./annotation-report.component";
import {TrackUsageComponent} from "./track-usage.component";

const ROUTES: Routes = [
    { path: "AnnotationProgressReport", component: AnnotationProgressReportComponent },
    { path: "ProjectExperimentReport", component: ProjectExperimentReportComponent },
    { path: "AnnotationReport", component: AnnotationReportComponent },
    { path: "TrackUsage", component: TrackUsageComponent },
];

export const REPORTS_ROUTING = RouterModule.forChild(ROUTES);
