import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { TreeModule } from "@circlon/angular-tree-component";
import { EmailRelatedUsersPopupModule } from "../util/emailRelatedUsersPopup/email-related-users-popup.module";
import {UtilModule} from "../util/util.module";
import {ServicesModule} from "../services/services.module";
import { AngularSplitModule } from "angular-split";
import {BrowseAnalysisComponent} from "./browse-analysis.component";
import {ANALYSIS_ROUTING} from "./analysis.routes";
import {DeleteAnalysisComponent} from "./delete-analysis.component";
import { AngularMaterialModule} from "../../modules/angular-material.module";
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import {CreateAnalysisComponent} from "./create-analysis.component";
import {CreateAnalysisGroupComponent} from "./create-analysis-group.component";
import {DialogsModule} from "../util/popup/dialogs.module";
import {AnalysisOverviewModule} from "./analysis-overview/analysis-overview.module";
import {AnalysisDetailModule} from "./analysis-detail/analysis-detail.module";
import { HttpClientModule} from '@angular/common/http';
import {AngularEditorModule} from "@kolkov/angular-editor";
import {AccessibilityModule} from "../util/accessibility/accessibility.module";

/**
 * @author jdewell
 * @since 12/19/16
 */


@NgModule({
    imports: [
        MatAutocompleteModule,
        AngularMaterialModule,
        DialogsModule,
        ANALYSIS_ROUTING,
        CommonModule,
        EmailRelatedUsersPopupModule,
        FormsModule,
        ServicesModule,
        TreeModule,
        UtilModule,
        ReactiveFormsModule,
        AngularSplitModule,
        AnalysisOverviewModule,
        HttpClientModule,
        AnalysisDetailModule,
        AngularEditorModule,
        AccessibilityModule
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
