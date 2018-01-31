/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {Routes, RouterModule} from "@angular/router";
import {LogoutComponent} from "./logout.component";
import {ExternalRoute} from "./external-routes.module";

/**
 * A file defining and exporting the router configuration for the home module.
 *
 * @author brandony <brandon.youkstetter@hci.utah.edu>
 * @since 7/10/16
 */
const ROUTES: Routes = [
    {path: "logout", component: LogoutComponent}
];

export const HEADER_ROUTING = RouterModule.forChild(ROUTES);