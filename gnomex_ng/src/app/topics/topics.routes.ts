/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import { Routes, RouterModule } from "@angular/router";
import {BrowseTopicsComponent} from "./browse-topics.component";
import {SubRouteGuardService} from "../services/route-guards/sub-route-guard.service";
import {TopicDetailComponent} from "./topics-detail.component";
import {ExperimentResolverService} from "../services/resolvers/experiment-resolver.service";
import {AnalysisResolverService} from "../services/resolvers/analysis-resolver.service";
import {DatatrackResolverService} from "../services/resolvers/datatrack-resolver.service";
import {LabResolverService} from "../services/resolvers/lab-resolver.service";
import {DatatracksDetailOverviewComponent} from "../datatracks/datatracks-detail/datatrack-detail-overview.component";
import {AnalysisDetailOverviewComponent} from "../analysis/analysis-detail/analysis-detail-overview.component";
import {ExperimentDetailOverviewComponent} from "../experiments/experiment-detail/experiment-detail-overview.component";


/**
 * A file defining and exporting the router configuration for the experiments module.
 *
 * @author jdewell
 * @since 12/19/16
 */
const ROUTES: Routes = [
    { path: "topics", component: BrowseTopicsComponent, children:[
            {path:'detail/:idLab', component: TopicDetailComponent, data:{fromTopic:true}, resolve: {topicLab: LabResolverService}, runGuardsAndResolvers: 'always'},
            {path: 'experiment/:idRequest', component: ExperimentDetailOverviewComponent, data:{fromTopic:true} ,resolve: {experiment: ExperimentResolverService}},
            {path: 'datatrack/:idDataTrack', component: DatatracksDetailOverviewComponent , data:{fromTopic:true}, resolve:{datatrack:DatatrackResolverService}},
            {path: 'analysis/:idAnalysis', component: AnalysisDetailOverviewComponent, data:{fromTopic:true}, resolve: {analysis: AnalysisResolverService }},
        ],
        canActivate: [SubRouteGuardService]
    }


];

export const TOPICS_ROUTING = RouterModule.forChild(ROUTES);
