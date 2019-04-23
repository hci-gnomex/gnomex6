/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import { Routes, RouterModule } from "@angular/router";
import { BrowseExperimentsComponent } from "./browse-experiments.component";
import { ExperimentOrdersComponent } from "./orders/experiment-orders.component";
import { BrowseOverviewComponent } from "./browse-overview/browse-overview.component";
import { ExperimentResolverService, ProjectResolverService } from "../services/resolvers/index";
import {ReassignExperimentComponent} from "./reassign-experiment.component";
import {CreateProjectLauncherComponent} from "./create-project-launcher-component";
import {SubRouteGuardService} from "../services/route-guards/sub-route-guard.service";
import {ProjectListResolverService} from "../services/resolvers/project-list-resolver.service";
import {ExperimentDetailOverviewComponent} from "./experiment-detail/experiment-detail-overview.component";
import {NewExperimentComponent} from "./new-experiment/new-experiment.component";
import {NewExternalExperimentComponent} from "./new-experiment/new-external-experiment.component";

/**
 * A file defining and exporting the router configuration for the experiments module.
 *
 * @author mbyrne
 * @since 12/19/16
 */
const ROUTES: Routes = [



    { path: 'experiments', component: BrowseExperimentsComponent , children:[ // for stepping through app to this page
        {path: '', pathMatch: 'full', redirectTo: '/experiments/(browsePanel:overview)' },
        {path:'overview',component: BrowseOverviewComponent, outlet: 'browsePanel', resolve:{project:ProjectResolverService}},
        {path:':id', component: ExperimentDetailOverviewComponent, outlet: 'browsePanel',resolve: {experiment: ExperimentResolverService}}],
        canActivate: [SubRouteGuardService]
    },
    { path: "experiments/:idProject", component:BrowseExperimentsComponent, children:[
        {path: '', pathMatch: 'full', redirectTo: '/experiments/:idProject/(browsePanel:overview)' },
        {path:'overview',component: BrowseOverviewComponent, outlet: 'browsePanel', resolve:{project:ProjectResolverService}},
        {path:':id', component: ExperimentDetailOverviewComponent, outlet: 'browsePanel',resolve: {experiment: ExperimentResolverService}}],
        canActivate: [SubRouteGuardService], resolve:{projectList:ProjectListResolverService}, runGuardsAndResolvers: 'paramsChange'
    },


    { path: "experiments-orders", component:ExperimentOrdersComponent},
    { path: "newProject", component: CreateProjectLauncherComponent, outlet: 'modal' },
    { path: "newExperiment", component: NewExperimentComponent, runGuardsAndResolvers: 'paramsOrQueryParamsChange' },
    { path: "newExperiment/:idCoreFacility", component: NewExperimentComponent, runGuardsAndResolvers: 'paramsOrQueryParamsChange' },
    { path: "new-external-experiment", component: NewExternalExperimentComponent }

];

export const EXPERIMENTS_ROUTING = RouterModule.forChild(ROUTES);
/* this is how you can do multiple required params with an auxiliary route
    {path:'overview/:idLab/:idProject',component: ProjectOverviewComponent, outlet: 'browsePanel', resolve:{project:ProjectResolverService}},
Here is what the url looks like;
    http://localhost/gnomex/experiments/(browsePanel:overview/1312/58345)
Here is how you would navigate to it
    this.router.navigate(['/experiments',{outlets:{'browsePanel':['overview',idLab,idProject]}}]);
*/
