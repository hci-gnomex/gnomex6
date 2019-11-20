import {Routes, RouterModule} from "@angular/router";
import {LogoutLoaderComponent} from "./logout-loader-component";

/**
 * A file defining and exporting the router configuration for the home module.
 *
 * @author brandony <brandon.youkstetter@hci.utah.edu>
 * @since 7/10/16
 */

const ROUTES: Routes = [
    {path: "logout-loader", component: LogoutLoaderComponent }
];

export const HEADER_ROUTING = RouterModule.forChild(ROUTES);
