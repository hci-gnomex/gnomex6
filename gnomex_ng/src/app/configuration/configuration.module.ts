import {NgModule} from "@angular/core";

import {CONFIGURATION_ROUTING} from "./configuration.routes";
import {AngularMaterialModule} from '../../modules/angular-material.module'
import {CommonModule} from "@angular/common";
import {FormsModule} from '@angular/forms';
import {ServicesModule} from "../services/services.module";
import {TreeModule} from "angular-tree-component";

import {BrowseDictionaryComponent, BrowseDictionaryComponentLauncher} from "./browse-dictionary.component";
import {ConfigureAnnotationsComponent} from "./configure-annotations.component";
import {AgGridModule} from "ag-grid-angular";


@NgModule({
    imports: [
        CONFIGURATION_ROUTING,
        AngularMaterialModule,
        CommonModule,
        FormsModule,
        ServicesModule,
        TreeModule,
        AgGridModule.withComponents([]),
    ],
    declarations: [
        BrowseDictionaryComponent,
        BrowseDictionaryComponentLauncher
        ConfigureAnnotationsComponent,
    ],
    exports: [
        BrowseDictionaryComponentLauncher
    ]

})

export class ConfigurationModule {
}
