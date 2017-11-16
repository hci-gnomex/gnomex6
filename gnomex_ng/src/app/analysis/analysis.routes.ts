/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import { Routes, RouterModule } from "@angular/router";
import {BrowseAnalysisComponent} from "../analysis/browse-analysis.component";
import {BrowseOverviewComponent} from "../experiments/browse-overview/browse-overview.component";
import {ProjectResolverService} from "../services/resolvers/project-resolver.service";


/**
 * A file defining and exporting the router configuration for the experiments module.
 *
 * @author mbyrne
 * @since 12/19/16
 */
const ROUTES: Routes = [
    { path: "analysis", component: BrowseAnalysisComponent , children:[
        {path:'overview',component: BrowseOverviewComponent, outlet: 'browsePanel', resolve:{project:ProjectResolverService}}]
    }
];

export const ANALYSIS_ROUTING = RouterModule.forChild(ROUTES);
/* this is how you can do multiple required params with an auxiliary route
    {path:'overview/:idLab/:idProject',component: ProjectOverviewComponent, outlet: 'browsePanel', resolve:{project:ProjectResolverService}},
Here is what the url looks like;
    http://localhost/gnomex/experiments/(browsePanel:overview/1312/58345)
Here is how you would navigate to it
    this.router.navigate(['/experiments',{outlets:{'browsePanel':['overview',idLab,idProject]}}]);
*/
