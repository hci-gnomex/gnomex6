import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatGridListModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatToolbarModule,
    ShowOnDirtyErrorStateMatcher
} from '@angular/material';
import {HEADER_ROUTING} from "./header.routes";
import {AgGridModule} from 'ag-grid-angular/main';
import {AngularMaterialModule} from "../../modules/angular-material.module";
import {NewBillingAccountModule} from "../billing/new_billing_account/new-billing-account.module";

import {AdvancedSearchComponent} from "./advanced_search/advanced-search.component";
import {CreateReportProblemLauncherComponent} from "./reportProblem/report-problem-launcher.component";
import {ExternalLinkComponent} from './external-routes.module';
import {ExternalLinkResolver} from './external-routes.module';
import {HeaderComponent} from "./header.component";
import {IconTextRendererComponent} from "../util/grid-renderers/icon-text-renderer.component";
import {LogoutComponent} from "./logout.component";
import {ManageLinksComponent} from "./manageLinks/manage-links.component";
import {ManageLinksLauncherComponent} from "./manageLinks/manage-links-launcher.component";
import {MenuItemComponent} from './menu-item/menu-item.component';
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

@NgModule({
    imports: [
        HEADER_ROUTING,
        CommonModule,
        BrowserModule,
        NgbModule.forRoot(),
        FormsModule,
        CommonModule,
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
        TreeModule,
        ServicesModule,
        UploadModule
    ],
    providers: [
       AdvancedSearchService,
       ExternalLinkResolver
    ],

    declarations: [
        AdvancedSearchComponent,
        CreateReportProblemLauncherComponent,
        ExternalLinkComponent,
        HeaderComponent,
        LogoutComponent,
        ManageLinksComponent,
        ManageLinksLauncherComponent,
        MenuItemComponent,
        ReportProblemComponent,
    ],
    entryComponents:[
        AdvancedSearchComponent,
        ExternalLinkComponent,
        ManageLinksComponent,
        ReportProblemComponent,
    ],
    exports: [
        AdvancedSearchComponent,
        HeaderComponent,
        LogoutComponent,
        ManageLinksComponent,
        ReportProblemComponent,
    ]
})
export class HeaderModule {
}
