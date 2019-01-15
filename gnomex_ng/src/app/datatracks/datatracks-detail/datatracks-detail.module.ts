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
import {ConfigAnnotationDialogComponent} from "../../util/config-annotation-dialog.component";
import {ConfigureAnnotationsModule} from "../../util/configure-annotations.module";
import {RichEditorModule} from "../../../modules/rich-editor.module";
import {RelatedDataModule} from "../../util/related-data.module";
import {DatatracksFilesTabComponent} from "./datatracks-files-tab.component";
import {AgGridModule} from "ag-grid-angular";

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
        RichEditorModule,
        UtilModule,
        ReactiveFormsModule,
        ConfigureAnnotationsModule,
        RelatedDataModule,
        AgGridModule.withComponents([
        ]),
    ],
    declarations: [
        DatatracksDetailOverviewComponent,
        DatatracksSummaryTabComponent,
        DatatracksVisibilityTabComponent,
        DatatracksFilesTabComponent,
    ],
    entryComponents: [ConfigAnnotationDialogComponent]
})
export class DatatracksDetailModule {
}
