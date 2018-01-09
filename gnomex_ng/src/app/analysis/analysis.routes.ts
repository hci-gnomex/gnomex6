/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import { Routes, RouterModule } from "@angular/router";
import {BrowseAnalysisComponent} from "../analysis/browse-analysis.component";

import {AnalysisOverviewComponent} from "./analysis-overview/analysis-overview.component";
import {AnalysisGroupResolverService} from "../services/resolvers/analysis-group-resolver.service";
import {AnalysisDetailComponent} from "./analysis-detail/analysis-detail.component";


/**
 * A file defining and exporting the router configuration for the experiments module.
 *
 * @author mbyrne
 * @since 12/19/16
 */
const ROUTES: Routes = [
    { path: "analysis", component: BrowseAnalysisComponent , children:[
            {path:'overview',component: AnalysisOverviewComponent, outlet: 'analysisPanel', resolve:{analysisGroup:AnalysisGroupResolverService}},
            {path:':id', component: AnalysisDetailComponent, outlet: 'analysisPanel',resolve: {analysis: AnalysisGroupResolverService}}
        ]
    }
];

export const ANALYSIS_ROUTING = RouterModule.forChild(ROUTES);
