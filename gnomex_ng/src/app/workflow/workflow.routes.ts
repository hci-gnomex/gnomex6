/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import { Routes, RouterModule } from "@angular/router";
import {SubRouteGuardService} from "../services/route-guards/sub-route-guard.service";
import {QcWorkflowComponent} from "./qc-workflow.component";


/**
 * A file defining and exporting the router configuration for the experiments module.
 *
 * @author jdewell
 * @since 12/19/16
 */
const ROUTES: Routes = [
    { path: "qcWorkFlow", component: QcWorkflowComponent, canActivate: [SubRouteGuardService]}
];

export const WORKFLOW_ROUTING = RouterModule.forChild(ROUTES);
