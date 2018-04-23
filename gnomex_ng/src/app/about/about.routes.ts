/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {Routes, RouterModule} from "@angular/router";
import {AboutWindowLauncher} from "./about-window-launcher";
import {ContactUsWindowLauncher} from "./contact-us-window-launcher";

/**
 * A file defining and exporting the router configuration for the about module.
 *
 * @author brandony <brandon.youkstetter@hci.utah.edu>
 * @since 7/10/16
 */
const ROUTES: Routes = [
    { path: "about-window-modal", component: AboutWindowLauncher, outlet: 'modal' },
    { path: "contact-us-window-modal", component: ContactUsWindowLauncher, outlet: 'modal'}
];

export const ABOUT_ROUTES = RouterModule.forChild(ROUTES);