import {RouterModule, Routes} from "@angular/router";
import {AnnotationProgressReportComponent} from "./annotation-progress-report.component";
import {ProjectExperimentReportComponent} from "./project-experiment-report.component";
import {AnnotationReportComponent} from "./annotation-report.component";
import {TrackUsageComponent} from "./track-usage.component";
import {EmailAllUsersLauncherComponent} from "./email-all-users-launcher.component";

const ROUTES: Routes = [
    { path: "AnnotationProgressReport", component: AnnotationProgressReportComponent },
    { path: "ProjectExperimentReport", component: ProjectExperimentReportComponent },
    { path: "AnnotationReport", component: AnnotationReportComponent },
    { path: "TrackUsage", component: TrackUsageComponent },
    { path: "EmailAll", component: EmailAllUsersLauncherComponent, outlet: 'modal' },
];

export const REPORTS_ROUTING = RouterModule.forChild(ROUTES);