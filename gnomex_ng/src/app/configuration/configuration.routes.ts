import { Routes, RouterModule } from "@angular/router";
import { BrowseDictionaryComponent } from "./browse-dictionary.component";
import {ConfigCoreFacilityComponent} from "./config-core-facility.component";
import {ConfigureAnnotationsComponent} from "../util/configure-annotations.component";
import {ConfigureOrganismsComponent} from "./configure-organisms.component";
import {ManageProtocolsComponent} from "./manage-protocols.component";

const ROUTES: Routes = [
    { path: "browse-dictionary", component: BrowseDictionaryComponent },
    { path: "editDictionary", component: BrowseDictionaryComponent, outlet: 'modal' },
    { path: "configure-core-facility", component: ConfigCoreFacilityComponent},
    { path: "configure-annotations", component: ConfigureAnnotationsComponent },
    { path: "configure-annotations/:idCoreFacility", component: ConfigureAnnotationsComponent },
    { path: "configure-organisms", component: ConfigureOrganismsComponent },
    { path: "manage-protocols", component: ManageProtocolsComponent },
];

export const CONFIGURATION_ROUTING = RouterModule.forChild(ROUTES);
