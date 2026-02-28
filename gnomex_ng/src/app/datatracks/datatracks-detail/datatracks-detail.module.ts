import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule,ReactiveFormsModule} from "@angular/forms";

import {AngularMaterialModule} from "../../../modules/angular-material.module";
import {DialogsModule} from "../../util/popup/dialogs.module";
import {DATATRACKS_ROUTING} from "../datatracks.routes";
import {ServicesModule} from "../../services/services.module";
import {UtilModule} from "../../util/util.module";

import {DatatracksDetailOverviewComponent,
        DatatracksSummaryTabComponent,
        DatatracksVisibilityTabComponent} from "./index"
import {ConfigureAnnotationsModule} from "../../util/configure-annotations.module";
import {RelatedDataModule} from "../../util/related-data.module";
import {DatatracksFilesTabComponent} from "./datatracks-files-tab.component";
import {AgGridModule} from "ag-grid-angular";
import {AngularEditorModule} from "@kolkov/angular-editor";

/**
 * @author Erik Rasmussen
 */

@NgModule({
    imports: [
        AngularMaterialModule,
        DialogsModule,
        DATATRACKS_ROUTING,
        CommonModule,
        FormsModule,
        ServicesModule,
        UtilModule,
        ReactiveFormsModule,
        ConfigureAnnotationsModule,
        RelatedDataModule,
        AngularEditorModule,
        AgGridModule.withComponents([
        ]),
    ],
    declarations: [
        DatatracksDetailOverviewComponent,
        DatatracksSummaryTabComponent,
        DatatracksVisibilityTabComponent,
        DatatracksFilesTabComponent,
    ]
})
export class DatatracksDetailModule {
}
