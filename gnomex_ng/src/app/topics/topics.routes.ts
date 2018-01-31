/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import { Routes, RouterModule } from "@angular/router";
import {BrowseTopicsComponent} from "./browse-topics.component";


/**
 * A file defining and exporting the router configuration for the experiments module.
 *
 * @author jdewell
 * @since 12/19/16
 */
const ROUTES: Routes = [
    { path: "topics", component: BrowseTopicsComponent
    }
];

export const TOPICS_ROUTING = RouterModule.forChild(ROUTES);
