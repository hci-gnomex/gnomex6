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
import {MenuItemComponent} from './menu-item/menu-item.component';

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
import {LogoutComponent} from "./logout.component";

@NgModule({
  imports: [HEADER_ROUTING, CommonModule,
      BrowserModule,
      NgbModule.forRoot(),
      FormsModule,
      CommonModule,
      UserModule,
      AngularMaterialModule,
      BrowserAnimationsModule
  ],
   providers: [
       // {provide: MD_ERROR_GLOBAL_OPTIONS, useValue: {errorStateMatcher: showOnDirtyErrorStateMatcher}}
    ],

    declarations: [HeaderComponent, MenuItemComponent, LogoutComponent],
    exports: [HeaderComponent, LogoutComponent
    ]
})
export class HeaderModule {
}
