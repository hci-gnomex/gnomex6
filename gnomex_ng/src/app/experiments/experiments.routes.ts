/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import { Routes, RouterModule } from "@angular/router";
import { BrowseExperimentsComponent } from "./browse-experiments.component";
import { ViewExperimentComponent } from "./view-experiment.component";
import {NewExperimentComponent} from "./experiment-detail/new-experiment.component";
import { ExperimentOrdersComponent } from "./orders/experiment-orders.component";
import { BrowseOverviewComponent } from "./browse-overview/browse-overview.component";
import { ExperimentDetail } from "./experiment-detail/experiment-detail.component";
import { ExperimentResolverService, ProjectResolverService } from "../services/resolvers/index";


/**
 * A file defining and exporting the router configuration for the experiments module.
 *
 * @author mbyrne
 * @since 12/19/16
 */
const ROUTES: Routes = [


    { path: "experiments", component: BrowseExperimentsComponent },
    { path: "experiments/new", component:NewExperimentComponent},
    { path: "experiments-orders", component:ExperimentOrdersComponent}
];

export const EXPERIMENTS_ROUTING = RouterModule.forChild(ROUTES);
/* this is how you can do multiple required params with an auxiliary route
    {path:'overview/:idLab/:idProject',component: ProjectOverviewComponent, outlet: 'browsePanel', resolve:{project:ProjectResolverService}},
Here is what the url looks like;
    http://localhost/gnomex/experiments/(browsePanel:overview/1312/58345)
Here is how you would navigate to it
    this.router.navigate(['/experiments',{outlets:{'browsePanel':['overview',idLab,idProject]}}]);
*/
