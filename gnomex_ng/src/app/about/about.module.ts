import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {AboutComponent} from "./about.component";
import {AngularMaterialModule} from "../../modules/angular-material.module";
import {ContactUsComponent} from "./contact-us.component";

@NgModule({
    imports: [
        CommonModule,
        AngularMaterialModule,
    ],
    declarations: [
        AboutComponent,
        ContactUsComponent,
    ],
    entryComponents: [
        AboutComponent,
        ContactUsComponent,
    ],
})

export class AboutModule {
}
