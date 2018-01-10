/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import { Routes, RouterModule } from "@angular/router";
import {BrowseOverviewComponent} from "../experiments/browse-overview/browse-overview.component";
import {ProjectResolverService} from "../services/resolvers/project-resolver.service";
import {BrowseDatatracksComponent} from "./browse-datatracks.component";


/**
 * A file defining and exporting the router configuration for the experiments module.
 *
 * @author jdewell
 * @since 12/19/16
 */
const ROUTES: Routes = [
    { path: "datatracks", component: BrowseDatatracksComponent
    }
];

export const DATATRACKS_ROUTING = RouterModule.forChild(ROUTES);
