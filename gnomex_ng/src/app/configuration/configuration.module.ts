import {NgModule} from "@angular/core";

import {CONFIGURATION_ROUTING} from "./configuration.routes";
import {AngularMaterialModule} from '../../modules/angular-material.module'
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ServicesModule} from "../services/services.module";
import {TreeModule} from "angular-tree-component";

import {AgGridModule} from "ag-grid-angular";
import {AngularSplitModule} from "angular-split";
import {BrowseDictionaryComponent} from "./browse-dictionary.component";
import {ConfigureAnnotationsModule} from "../util/configure-annotations.module";
import {RichEditorModule} from "../../modules/rich-editor.module";
import {UtilModule} from "../util/util.module";

import {ConfigCoreFacilityComponent} from "./config-core-facility.component"
import {ConfigCoreFacilityEditComponent} from "./config-core-facility-edit.component";
import {ConfigureOrganismsComponent} from "./configure-organisms.component";
import {CheckboxRenderer} from "../util/grid-renderers/checkbox.renderer";
import {CreateProtocolDialogComponent} from "./create-protocol-dialog.component";
import {DateEditor} from "../util/grid-editors/date.editor";
import {DateRenderer} from "../util/grid-renderers/date.renderer";
import {EditProtocolComponent} from "./edit-protocol.component";
import {ManageProtocolsComponent} from "./manage-protocols.component";
import {ConfigurationBrowsePanelComponent} from "./configuration-browse-panel.component";
import {OverviewProtocolComponent} from "./overview-protocol.component";
import {ExperimentPlatformModule} from "./experiment-platform/experiment-platform.module";



@NgModule({
    imports: [
        CONFIGURATION_ROUTING,
        ConfigureAnnotationsModule,
        AngularMaterialModule,
        CommonModule,
        FormsModule,
        ServicesModule,
        TreeModule.forRoot(),
        AgGridModule.withComponents([
            CheckboxRenderer,
            DateEditor,
            DateRenderer,
        ]),
        UtilModule,
        RichEditorModule,
        ReactiveFormsModule,
        AngularSplitModule,
        ExperimentPlatformModule
    ],
    declarations: [
        BrowseDictionaryComponent,
        ConfigCoreFacilityComponent,
        ConfigCoreFacilityEditComponent,
        ConfigurationBrowsePanelComponent,
        ConfigureOrganismsComponent,
        CreateProtocolDialogComponent,
        EditProtocolComponent,
        ManageProtocolsComponent,
        OverviewProtocolComponent
    ],
    entryComponents: [
        CreateProtocolDialogComponent
    ],
    exports: [
    ]

})

export class ConfigurationModule {
}
