import {NgModule} from "@angular/core";

import {CONFIGURATION_ROUTING} from "./configuration.routes";
import {AngularMaterialModule} from '../../modules/angular-material.module'
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ServicesModule} from "../services/services.module";
import {TreeModule} from "angular-tree-component";

import {BrowseDictionaryComponent, BrowseDictionaryComponentLauncher} from "./browse-dictionary.component";
import {AgGridModule} from "ag-grid-angular";
import {ConfigCoreFacilityComponent} from "./config-core-facility.component"
import {AngularSplitModule} from "angular-split";
import {ConfigCoreFacilityEditComponent} from "./config-core-facility-edit.component";
import {UtilModule} from "../util/util.module";
import {RichEditorModule} from "../../modules/rich-editor.module";
import {ConfigureOrganismsComponent} from "./configure-organisms.component";
import {CheckboxRenderer} from "../util/grid-renderers/checkbox.renderer";
import {DateEditor} from "../util/grid-editors/date.editor";
import {DateRenderer} from "../util/grid-renderers/date.renderer";
import {ConfigureAnnotationsModule} from "../util/configure-annotations.module";
import {ManageProtocolsComponent} from "./manage-protocols.component";



@NgModule({
    imports: [
        CONFIGURATION_ROUTING,
        ConfigureAnnotationsModule,
        AngularMaterialModule,
        CommonModule,
        FormsModule,
        ServicesModule,
        TreeModule,
        AgGridModule.withComponents([
            CheckboxRenderer,
            DateEditor,
            DateRenderer,
        ]),
        UtilModule,
        RichEditorModule,
        ReactiveFormsModule,
        AngularSplitModule

    ],
    declarations: [
        BrowseDictionaryComponent,
        BrowseDictionaryComponentLauncher,
        ConfigCoreFacilityComponent,
        ConfigCoreFacilityEditComponent,
        ConfigureOrganismsComponent,
        ManageProtocolsComponent
    ],
    exports: [
        BrowseDictionaryComponentLauncher
    ]

})

export class ConfigurationModule {
}
