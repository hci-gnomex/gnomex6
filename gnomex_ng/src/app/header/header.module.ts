/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {UserModule} from "@hci/user";

import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {HeaderComponent} from "./header.component";
import {
    MdGridListModule,
    MdToolbarModule,
    MdButtonModule,
    MdMenuModule,
    MdInputModule,
    MdListModule,
    MdFormFieldModule,
    MdStepperModule, MdError, showOnDirtyErrorStateMatcher, MD_ERROR_GLOBAL_OPTIONS

}  from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {HEADER_ROUTING} from "./header.routes";

@NgModule({
  imports: [HEADER_ROUTING, CommonModule,
      BrowserModule,
      NgbModule.forRoot(),
      FormsModule,
      CommonModule,
      UserModule,
      MdButtonModule,
      MdMenuModule,
      MdInputModule,
      MdListModule,
      MdGridListModule,
      MdToolbarModule,
      MdFormFieldModule,
      BrowserAnimationsModule
  ],
   providers: [
        {provide: MD_ERROR_GLOBAL_OPTIONS, useValue: {errorStateMatcher: showOnDirtyErrorStateMatcher}}
   ],

    declarations: [HeaderComponent],
    exports: [HeaderComponent]
})
export class HeaderModule {
}
