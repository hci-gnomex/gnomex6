/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {NgModule} from "@angular/core";
import {HOME_ROUTING} from "./home.routes";
import {CommonModule} from "@angular/common";
import {HomeComponent} from "./home.component";
import {ProgressService} from "../home/progress.service";
import { ProgressBarModule } from "../../modules/progressbar.module";
import { WindowModule }       from "../../modules/window.module";
import {LaunchPropertiesService} from "../services/launch-properites.service";

@NgModule({
  imports: [HOME_ROUTING, CommonModule,
      WindowModule, ProgressBarModule],
  declarations: [HomeComponent],
  providers: [ProgressService, LaunchPropertiesService

  ]
})
export class HomeModule {
}
