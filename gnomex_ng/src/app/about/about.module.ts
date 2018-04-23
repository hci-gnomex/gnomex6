/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {NgModule} from "@angular/core";
import {ABOUT_ROUTES} from "./about.routes";
import {CommonModule} from "@angular/common";
import {AboutComponent} from "./about.component";
import {AboutWindowLauncher} from "./about-window-launcher";
import {AngularMaterialModule} from "../../modules/angular-material.module";
import {ContactUsWindowLauncher} from "./contact-us-window-launcher";
import {ContactUsComponent} from "./contact-us.component";

@NgModule({
    imports: [
        ABOUT_ROUTES,
        CommonModule,
        AngularMaterialModule,
    ],
    declarations: [
        AboutComponent,
        AboutWindowLauncher,
        ContactUsWindowLauncher,
        ContactUsComponent,
    ],
    entryComponents: [
        AboutComponent,
        ContactUsComponent,
    ],
})

export class AboutModule {
}
