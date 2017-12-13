/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {UserModule} from "@hci/user";

import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {HeaderComponent} from "./header.component";

import {
    MatGridListModule,
    MatToolbarModule,
    MatButtonModule,
    MatInputModule,
    MatListModule,
    MatFormFieldModule,
	MatMenuModule, ShowOnDirtyErrorStateMatcher}  from '@angular/material';
import {HEADER_ROUTING} from "./header.routes";
import {AngularMaterialModule} from "../../modules/angular-material.module";
import {NewBillingAccountModule} from "../billing/new_billing_account/new-billing-account.module";

@NgModule({
  imports: [
      HEADER_ROUTING,
      CommonModule,
      BrowserModule,
      NgbModule.forRoot(),
      FormsModule,
      CommonModule,
      UserModule,
      AngularMaterialModule,
      BrowserAnimationsModule,
      NewBillingAccountModule
  ],
   providers: [
       // {provide: MD_ERROR_GLOBAL_OPTIONS, useValue: {errorStateMatcher: showOnDirtyErrorStateMatcher}}
    ],

    declarations: [HeaderComponent],
    exports: [HeaderComponent]
})
export class HeaderModule {
}
