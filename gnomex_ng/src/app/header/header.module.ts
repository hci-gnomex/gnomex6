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
    MatMenuModule,
    MatStepperModule,
    MatError
}  from '@angular/material';
import {HEADER_ROUTING} from "./header.routes";

@NgModule({
  imports: [HEADER_ROUTING, CommonModule,
      BrowserModule,
      NgbModule.forRoot(),
      FormsModule,
      CommonModule,
      UserModule,
      MatButtonModule,
      MatInputModule,
      MatListModule,
      MatGridListModule,
      MatToolbarModule,
      MatFormFieldModule,
      BrowserAnimationsModule
  ],
   providers: [
    ],

    declarations: [HeaderComponent],
    exports: [HeaderComponent]
})
export class HeaderModule {
}
