/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import { Routes, RouterModule } from "@angular/router";
import {BrowseDatatracksComponent} from "./browse-datatracks.component";
import {DatatracksOrganismComponent} from "./datatracks-overview/datatracks-organism.component";
import {DatatracksGenomeBuildComponent} from "./datatracks-overview/genome-build/datatracks-genome-build.component";
import {GenomeBuildResolverService} from "../services/resolvers/genome-build-resolver.service";
import {DatatracksFolderComponent} from "./datatracks-overview/datatracks-folder.component";
import {SubRouteGuardService} from "../services/route-guards/sub-route-guard.service";
import {DatatrackResolverService} from "../services/resolvers/datatrack-resolver.service";
import {DatatracksDetailOverviewComponent} from "./datatracks-detail/datatrack-detail-overview.component";


/**
 * A file defining and exporting the router configuration for the experiments module.
 *
 * @author jdewell
 * @since 12/19/16
 */
const ROUTES: Routes = [
    {
        path: "datatracks", component: BrowseDatatracksComponent, children:[
            {
                path:'organism',
                component: DatatracksOrganismComponent
            },
            {
                path:'genomebuild',
                component:DatatracksGenomeBuildComponent,
                resolve: {genomeBuild: GenomeBuildResolverService},
                runGuardsAndResolvers: "always"
            },
            {
                path:'folder',
                component: DatatracksFolderComponent
            },
            {
                path:'detail/:idDataTrack',
                component: DatatracksDetailOverviewComponent,
                resolve: {datatrack: DatatrackResolverService },
                runGuardsAndResolvers: "always"
            }
        ],
        canActivate: [SubRouteGuardService]
    }



];

export const DATATRACKS_ROUTING = RouterModule.forChild(ROUTES);
