
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
//import {EditorModule} from "@tinymce/tinymce-angular"



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
        RelatedDataModule
        //EditorModule  will be using once artifactory is pulling in latest version correctly

    ],
    declarations: [
        DatatracksDetailOverviewComponent,
        DatatracksSummaryTabComponent,
        DatatracksVisibilityTabComponent

    ],
    entryComponents: [ConfigAnnotationDialogComponent]
})
export class DatatracksDetailModule {
}
