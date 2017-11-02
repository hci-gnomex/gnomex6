/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import { RouterModule } from "@angular/router";
import { BrowseExperimentsComponent } from "./browse-experiments.component";
import { ViewExperimentComponent } from "./view-experiment.component";
import { ExperimentOrdersComponent } from "./orders/experiment-orders.component";
/**
 * A file defining and exporting the router configuration for the experiments module.
 *
 * @author mbyrne
 * @since 12/19/16
 */
var ROUTES = [
    { path: "experiments", component: BrowseExperimentsComponent },
    { path: "experiments/:id", component: ViewExperimentComponent },
    { path: "experiments-orders", component: ExperimentOrdersComponent }
];
export var EXPERIMENTS_ROUTING = RouterModule.forChild(ROUTES);
//# sourceMappingURL=experiments.routes.js.map