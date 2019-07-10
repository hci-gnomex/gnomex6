import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { TreeModule } from "angular-tree-component";
import { EmailRelatedUsersPopupModule } from "../util/emailRelatedUsersPopup/email-related-users-popup.module";
import {UtilModule} from "../util/util.module";
import {ServicesModule} from "../services/services.module";
import { AngularSplitModule } from "angular-split";
import {BrowseAnalysisComponent} from "./browse-analysis.component";
import {ANALYSIS_ROUTING} from "./analysis.routes";
import {DeleteAnalysisComponent} from "./delete-analysis.component";
import { AngularMaterialModule} from "../../modules/angular-material.module";
import {MatAutocompleteModule} from "@angular/material";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {CreateAnalysisComponent} from "./create-analysis.component";
import {CreateAnalysisGroupComponent} from "./create-analysis-group.component";
import {DialogsModule} from "../util/popup/dialogs.module";
import {AnalysisOverviewModule} from "./analysis-overview/analysis-overview.module";
import {AnalysisDetailModule} from "./analysis-detail/analysis-detail.module";
import {AngularEditorModule} from "@kolkov/angular-editor";

/**
 * @author jdewell
 * @since 12/19/16
 */


@NgModule({
    imports: [
        MatAutocompleteModule,
        AngularMaterialModule,
        DialogsModule,
        BrowserAnimationsModule,
        ANALYSIS_ROUTING,
        CommonModule,
        EmailRelatedUsersPopupModule,
        FormsModule,
        ServicesModule,
        TreeModule.forRoot(),
        UtilModule,
        ReactiveFormsModule,
        AngularSplitModule,
        AnalysisOverviewModule,
        AnalysisDetailModule,
        AngularEditorModule
    ],
    declarations: [
        BrowseAnalysisComponent,
        DeleteAnalysisComponent,
        CreateAnalysisComponent,
        CreateAnalysisGroupComponent
    ],
    entryComponents: [DeleteAnalysisComponent, CreateAnalysisComponent, CreateAnalysisGroupComponent],
    exports: [DeleteAnalysisComponent, CreateAnalysisComponent, CreateAnalysisGroupComponent]
})
export class AnalysisModule {
}
