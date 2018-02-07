/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {Routes, RouterModule} from "@angular/router";
import {LogoutComponent} from "./logout.component";
import {CreateReportProblemLauncherComponent} from "./reportProblem/report-problem-launcher.component";
import {ManageLinksLauncherComponent} from "./manageLinks/manage-links-launcher.component";

/**
 * A file defining and exporting the router configuration for the home module.
 *
 * @author brandony <brandon.youkstetter@hci.utah.edu>
 * @since 7/10/16
 */

const ROUTES: Routes = [
    {path: "logout", component: LogoutComponent},
    { path: "manageLinks", component: ManageLinksLauncherComponent, outlet: 'modal' },
    { path: "reportProblem", component: CreateReportProblemLauncherComponent, outlet: 'modal' }

];

export const HEADER_ROUTING = RouterModule.forChild(ROUTES);
