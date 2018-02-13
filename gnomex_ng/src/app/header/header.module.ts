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
      AgGridModule.withComponents([IconTextRendererComponent])

  ],
   providers: [
       ExternalLinkResolver
    ],

    declarations: [HeaderComponent, MenuItemComponent, LogoutComponent, ExternalLinkComponent, CreateReportProblemLauncherComponent, ReportProblemComponent,
        ManageLinksComponent, ManageLinksLauncherComponent],
    entryComponents:[ExternalLinkComponent, ReportProblemComponent, ManageLinksComponent],
    exports: [HeaderComponent, LogoutComponent, ReportProblemComponent, ManageLinksComponent]
})
export class HeaderModule {
}
