import { Routes, RouterModule } from "@angular/router";
import { BrowseDictionaryComponent } from "./browse-dictionary.component";
import {ConfigCoreFacilityComponent} from "./config-core-facility.component";
import {ConfigureAnnotationsComponent} from "./configure-annotations.component";

const ROUTES: Routes = [
    { path: "browse-dictionary", component: BrowseDictionaryComponent },
    { path: "editDictionary", component: BrowseDictionaryComponent, outlet: 'modal' },
    { path: "configure-core-facility", component: ConfigCoreFacilityComponent},
    { path: "configure-annotations", component: ConfigureAnnotationsComponent },
    { path: "configure-annotations/:idCoreFacility", component: ConfigureAnnotationsComponent },
];

export const CONFIGURATION_ROUTING = RouterModule.forChild(ROUTES);
