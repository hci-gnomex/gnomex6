/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {UserModule} from "@hci/user";

import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {HeaderComponent} from "./header.component";
import {MenuItemComponent} from './menu-item/menu-item.component';
import {ExternalLinkResolver} from './external-routes.module';
import {ExternalLinkComponent} from './external-routes.module';
import {
    MatGridListModule,
    MatToolbarModule,
    MatButtonModule,
    MatInputModule,
    MatListModule,
    MatFormFieldModule,
    MatMenuModule, ShowOnDirtyErrorStateMatcher, MatDialogModule
} from '@angular/material';
import {HEADER_ROUTING} from "./header.routes";
import {AngularMaterialModule} from "../../modules/angular-material.module";
import {NewBillingAccountModule} from "../billing/new_billing_account/new-billing-account.module";
import {LogoutComponent} from "./logout.component";
import {CreateReportProblemLauncherComponent} from "./reportProblem/report-problem-launcher.component";
import {ReportProblemComponent} from "./reportProblem/report-problem.component";
import {ManageLinksComponent} from "./manageLinks/manage-links.component";
import {AgGridModule} from 'ag-grid-angular/main';
import {IconTextRendererComponent} from "../util/grid-renderers/icon-text-renderer.component";
import {ManageLinksLauncherComponent} from "./manageLinks/manage-links-launcher.component";

import {AdvancedSearchComponent} from "./advanced_search/advanced-search.component";

import {AdvancedSearchService} from "./advanced_search/advanced-search.service";
import {TextSelectXorMultiselectEditor} from "../util/grid-editors/text-select-xor-multiselect.editor";
import {TextSelectXorMultiselectRenderer} from "../util/grid-renderers/text-select-xor-multiselect.renderer";

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
        UserModule,
        AngularMaterialModule,
        BrowserAnimationsModule,
        NewBillingAccountModule,
        MatDialogModule,
        AgGridModule.withComponents([
            IconTextRendererComponent,
            TextSelectXorMultiselectEditor,
            TextSelectXorMultiselectRenderer
        ])
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
