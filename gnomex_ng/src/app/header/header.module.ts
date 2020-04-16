import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";


import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {MatDialogModule} from "@angular/material";
import {HEADER_ROUTING} from "./header.routes";
import {AgGridModule} from "ag-grid-angular/main";
import {AngularMaterialModule} from "../../modules/angular-material.module";
import {NewBillingAccountModule} from "../billing/new_billing_account/new-billing-account.module";

import {AdvancedSearchComponent} from "./advanced_search/advanced-search.component";
import {ExternalLinkComponent} from "./external-routes.module";
import {ExternalLinkResolver} from "./external-routes.module";
import {HeaderComponent} from "./header.component";
import {IconTextRendererComponent} from "../util/grid-renderers/icon-text-renderer.component";
import {ManageLinksComponent} from "./manageLinks/manage-links.component";
import {MenuItemComponent} from "./menu-item/menu-item.component";
import {ReportProblemComponent} from "./reportProblem/report-problem.component";

import {DateRenderer} from "../util/grid-renderers/date.renderer";
import {SelectRenderer} from "../util/grid-renderers/select.renderer";
import {TextAlignLeftMiddleRenderer} from "../util/grid-renderers/text-align-left-middle.renderer";
import {TextAlignRightMiddleRenderer} from "../util/grid-renderers/text-align-right-middle.renderer";
import {TextSelectXorMultiselectEditor} from "../util/grid-editors/text-select-xor-multiselect.editor";
import {TextSelectXorMultiselectRenderer} from "../util/grid-renderers/text-select-xor-multiselect.renderer";

import {AdvancedSearchService} from "./advanced_search/advanced-search.service";
import {TreeModule} from "angular-tree-component";
import {ServicesModule} from "../services/services.module";
import {UploadModule} from "../upload/upload.module";
import {LogoutLoaderComponent} from "./logout-loader-component";
import {UtilModule} from "../util/util.module";

@NgModule({
    imports: [
        HEADER_ROUTING,
        CommonModule,
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        AngularMaterialModule,
        BrowserAnimationsModule,
        NewBillingAccountModule,
        MatDialogModule,
        AgGridModule.withComponents([
            DateRenderer,
            IconTextRendererComponent,
            SelectRenderer,
            TextAlignLeftMiddleRenderer,
            TextAlignRightMiddleRenderer,
            TextSelectXorMultiselectEditor,
            TextSelectXorMultiselectRenderer
        ]),
        TreeModule.forRoot(),
        ServicesModule,
        UploadModule,
        UtilModule
    ],
    providers: [
       AdvancedSearchService,
       ExternalLinkResolver
    ],

    declarations: [
        AdvancedSearchComponent,
        ExternalLinkComponent,
        HeaderComponent,
        ManageLinksComponent,
        MenuItemComponent,
        ReportProblemComponent,
        LogoutLoaderComponent
    ],
    entryComponents: [
        AdvancedSearchComponent,
        ExternalLinkComponent,
        ManageLinksComponent,
        ReportProblemComponent,
    ],
    exports: [
        AdvancedSearchComponent,
        HeaderComponent,
        ManageLinksComponent,
        ReportProblemComponent,
    ]
})
export class HeaderModule {
}
