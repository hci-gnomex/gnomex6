import { Routes, RouterModule } from "@angular/router";
import { BrowseDictionaryComponent } from "./browse-dictionary.component";

const ROUTES: Routes = [
    { path: "browse-dictionary", component: BrowseDictionaryComponent },
    { path: "editDictionary", component: BrowseDictionaryComponent, outlet: 'modal' }

];

export const CONFIGURATION_ROUTING = RouterModule.forChild(ROUTES);
