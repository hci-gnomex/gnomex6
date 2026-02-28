import { Routes, RouterModule } from "@angular/router";
import { BrowseDictionaryComponent } from "./browse-dictionary.component";
import {ConfigCoreFacilityComponent} from "./config-core-facility.component";
import {ConfigureAnnotationsComponent} from "../util/configure-annotations.component";
import {ConfigureOrganismsComponent} from "./configure-organisms.component";
import {ManageProtocolsComponent} from "./manage-protocols.component";
import {EditProtocolComponent} from "./edit-protocol.component";
import {OverviewProtocolComponent} from "./overview-protocol.component";
import {SubRouteGuardService} from "../services/route-guards/sub-route-guard.service";
import {ExperimentPlatformOverviewComponent} from "./experiment-platform/experiment-platform-overview.component";

const ROUTES: Routes = [
    { path: "browse-dictionary", component: BrowseDictionaryComponent },
    { path: "editDictionary", component: BrowseDictionaryComponent, outlet: 'modal' },
    { path: "configure-core-facility", component: ConfigCoreFacilityComponent},
    { path: "configure-annotations", component: ConfigureAnnotationsComponent },
    { path: "configure-experiment-platform", component: ExperimentPlatformOverviewComponent, canActivate: [SubRouteGuardService] },

    { path: "configure-annotations/:idCoreFacility", component: ConfigureAnnotationsComponent },
    { path: "configure-organisms", component: ConfigureOrganismsComponent },

    {
        path:      "manage-protocols",
        component: ManageProtocolsComponent,
        children:  [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: '/manage-protocols/(browsePanel:overview)'
            },
            {
                path:'overview',
                component: OverviewProtocolComponent,
                outlet: 'browsePanel',
            },
            {
                path:'details/:modelName/:id',
                component: EditProtocolComponent,
                outlet: 'browsePanel'
            }
        ],
        canActivate: [SubRouteGuardService]
    },
];

export const CONFIGURATION_ROUTING = RouterModule.forChild(ROUTES);
